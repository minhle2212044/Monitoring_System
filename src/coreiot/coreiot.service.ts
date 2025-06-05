import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as mqtt from 'mqtt';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CoreIotService implements OnModuleDestroy {
  private clients: Map<number, mqtt.MqttClient> = new Map();
  private MQTT_BROKER = 'mqtt://app.coreiot.io';
  private port = 1883;

  constructor(private readonly prisma: PrismaService, private readonly httpService: HttpService,) {}

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
    ];

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
        console.log(`Fetched telemetry for device ${device.deviceId}:`, telemetry);

        for (const field of fieldsToSave) {
          const entry = telemetry[field.key]?.[0];
          if (entry) {
            await this.prisma.data.create({
              data: {
                deviceId: device.id,
                time: new Date(entry.ts),
                type: field.key,
                data: parseFloat(entry.value),
                unit: field.unit,
              },
            });
          }
        }

        console.log(`Saved telemetry for device ${device.deviceId}`);
      } catch (error) {
        console.error(`Error fetching telemetry for device ${device.deviceId}:`, error.message);
      }
    }
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
  }
}
