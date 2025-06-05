import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class CoreIotService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private MQTT_BROKER = 'mqtt://app.coreiot.io'; // Hoặc wss:// nếu dùng websocket
  private port = 1883; // hoặc 8883 nếu dùng TLS

  onModuleInit() {
    this.client = mqtt.connect(this.MQTT_BROKER, {
      port: this.port,
      username: 'ElCQRtwf63oV7B1gYxlJ', // Token thiết bị chính là username
    });

    this.client.on('connect', () => {
      console.log('✅ MQTT connected to CoreIoT!');
    });

    this.client.subscribe('v1/devices/me/attributes', () => {
      console.log(`🔔 Subscribed to attributes for token`);
    });
    
    this.client.on('message', (topic, payload) => {
      console.log(`📥 Received on ${topic}: ${payload.toString()}`);
    });


    this.client.on('error', (err) => {
      console.error('❌ MQTT Error:', err.message);
    });
  }

  async sendTelemetry(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const topic = 'v1/devices/me/telemetry';
      const payload = JSON.stringify(data);

      this.client.publish(topic, payload, (err) => {
        if (err) {
          reject({ status: 'error', message: err.message });
        } else {
          resolve({ status: 'success', data });
        }
      });
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
    }
  }
}
