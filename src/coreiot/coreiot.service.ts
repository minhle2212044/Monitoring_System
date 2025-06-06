import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NoticeService } from '../notice/notice.service';
import * as mqtt from 'mqtt';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, interval, Subscription } from 'rxjs';

interface TelemetryData {
  id: number;
  type: string;
  deviceId: number;
  data: number;
  time: Date;
  unit: string;
}

export interface DeviceData {
  deviceId: string;
  data: TelemetryData[];
}

@Injectable()
export class CoreIotService implements OnModuleDestroy {
  private clients: Map<number, mqtt.MqttClient> = new Map();
  private MQTT_BROKER = 'mqtt://app.coreiot.io';
  private port = 1883;
  private pollingSubscription: Subscription | null = null;

  constructor(private readonly prisma: PrismaService, private readonly httpService: HttpService, private readonly noticeService: NoticeService) {}

  async startPollingTelemetry(userId: number, coreiotToken: string, intervalMs = 20000) {
    if (this.pollingSubscription) {
      console.log('Telemetry polling already running');
      return;
    }

    this.pollingSubscription = interval(intervalMs).subscribe(() => {
      this.fetchLatestTelemetryForUser(userId, coreiotToken);
    });

    console.log(`Started telemetry polling for user ${userId}`);
  }

  stopPollingTelemetry() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
      console.log('Stopped telemetry polling');
    }
  }

  async connectForUser(userId: number) {
    const devices = await this.prisma.device.findMany({
      where: { userId },
      select: { id: true, deviceId: true, token: true }
    });

    for (const device of devices) {
      if (this.clients.has(device.id)) continue;

      const client = mqtt.connect(this.MQTT_BROKER, {
        port: this.port,
        username: device.token,
      });

      this.clients.set(device.id, client);

      client.on('connect', () => {
        console.log(`MQTT connected for device ${device.deviceId}`);
        client.subscribe('v1/devices/me/telemetry', () => {
          console.log(`Subscribed to telemetry for ${device.deviceId}`);
        });
      });

      client.on('message', async (topic, payload) => {
        try {
          const telemetry = JSON.parse(payload.toString());
          const timestamp = new Date();
          for (const key of Object.keys(telemetry)) {
            await this.prisma.data.create({
              data: {
                deviceId: device.id,
                time: timestamp,
                type: key,
                data: parseFloat(telemetry[key]),
                unit: '',
              },
            });
          }
          console.log(`📥 Saved telemetry for ${device.deviceId}:`, telemetry);
        } catch (e) {
          console.error('❌ Parse error:', e);
        }
      });

      client.on('error', (err) => {
        console.error(`❌ MQTT error for ${device.deviceId}:`, err.message);
      });
    }
  }

  async fetchLatestTelemetryForUser(userId: number, coreiotToken: string) {
    console.log(`Fetching latest telemetry for user ${userId}...`);
    const devices = await this.prisma.device.findMany({
      where: { userId },
      select: { id: true, deviceId: true, token: true }
    });

    if (!devices.length) {
      console.log(`No devices found for user ${userId}`);
      return;
    }

    const fieldsToSave = [
      { key: 'temperature', unit: '°C' },
      { key: 'humidity', unit: '%' },
      { key: 'CO2', unit: 'ppm' },
      { key: 'PM25', unit: 'µg/m³' },
      { key: 'light', unit: 'lux' },
    ];
    const results: { deviceId: string; telemetry: { type: string; value: number; time: number; unit: string }[] }[] = [];

    for (const device of devices) {
      try {
        const response = await lastValueFrom(
          this.httpService.get(
            `https://app.coreiot.io/api/plugins/telemetry/DEVICE/${device.deviceId}/values/timeseries`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${coreiotToken}`,
              },
            }
          )
        );

        const telemetry = response.data;
        const savedFields: { type: string; value: number; time: number; unit: string }[] = [];

        console.log(`Fetched telemetry for device ${device.deviceId}:`, telemetry);

        for (const field of fieldsToSave) {
          const entry = telemetry[field.key]?.[0];
          if (entry) {
            const value = parseFloat(entry.value);
            await this.prisma.data.create({
              data: {
                deviceId: device.id,
                time: new Date(entry.ts),
                type: field.key,
                data: value,
                unit: field.unit,
              },
            });
            if (['CO2', 'PM25', 'temperature'].includes(field.key)) {
              const lastNotice = await this.prisma.notice.findFirst({
                where: {
                  userId,
                  message: { contains: field.key },
                },
                orderBy: { time: 'desc' },
              });

              const now = Date.now();
              const lastTime = lastNotice?.time?.getTime() || 0;
              const diffMinutes = (now - lastTime) / 60000;

              if (diffMinutes >= 30) {
                await this.noticeService.createWarningNoticeIfNeeded(userId, field.key, value);
              } else {
                console.log(`⏳ Skip notice for ${field.key}, only ${diffMinutes.toFixed(1)} minutes passed.`);
              }
            }
            savedFields.push({ type: field.key, value: parseFloat(entry.value), time: entry.ts, unit: field.unit });
          }
        }
        results.push({ deviceId: device.deviceId, telemetry: savedFields });
        console.log(`Saved telemetry for device ${device.deviceId}`);
      } catch (error) {
        console.error(`Error fetching telemetry for device ${device.deviceId}:`, error.message);
      }
    }
  }

  async getSensorDataFromDb(userId: number): Promise<DeviceData[]> {
    const devices = await this.prisma.device.findMany({
      where: { userId },
      select: { id: true, deviceId: true }
    });

    if (!devices.length) return [];

    const result: DeviceData[] = [];

    for (const device of devices) {
      const types = ['temperature', 'humidity', 'CO2', 'PM25', 'light'];
      const latestData: TelemetryData[] = [];

      for (const type of types) {
        const data = await this.prisma.data.findFirst({
          where: { deviceId: device.id, type },
          orderBy: { time: 'desc' },
        });
        if (data) latestData.push(data);
      }

      result.push({ deviceId: device.deviceId, data: latestData });
    }

    return result;
  }

  async sendTelemetry(deviceId: number, data: any): Promise<any> {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) throw new Error('Device not found');

    const topic = 'v1/devices/me/telemetry';
    const payload = JSON.stringify(data);

    const client = mqtt.connect(this.MQTT_BROKER, {
      port: this.port,
      username: device.token,
    });

    return new Promise((resolve, reject) => {
      client.on('connect', () => {
        client.publish(topic, payload, (err) => {
          client.end();
          if (err) reject({ status: 'error', message: err.message });
          else resolve({ status: 'success', data });
        });
      });
    });
  }

  onModuleDestroy() {
    this.clients.forEach((client) => client.end());
    this.clients.clear();
    this.stopPollingTelemetry();
  }
}
