#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// wifi
const char* ssid = "AH3-920";
const char* password = "12312311zq";

const char* mqtt_server = "app.coreiot.io";
const int mqtt_port = 1883;
// Token coreiot
const char* device_access_token = "jkYWdNxbhaRYsKd4okqS";
const char* telemetry_topic = "v1/devices/me/telemetry";

WiFiClient espClient;
PubSubClient client(espClient);

// mock data
#define USE_MOCK_SENSORS true

#if USE_MOCK_SENSORS
float mock_readTemperature() {
  return random(200, 350) / 10.0;
}

float mock_readHumidity() {
  return random(300, 900) / 10.0;
}

float mock_readCO2() {
  return random(400, 2000);
}

int mock_readPM25() {
  return random(5, 150);
}
#endif

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    retries++;
    if (retries > 20) { // Thử kết nối trong 10 giây
        Serial.println("\nFailed to connect to WiFi. Restarting...");
        ESP.restart(); // Khởi động lại nếu không kết nối được
    }
  }

  randomSeed(micros());
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect_mqtt() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);

    if (client.connect(clientId.c_str(), device_access_token, NULL)) {
      Serial.println("connected");
    } 
    else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    delay(10);
  }
  Serial.println("Board started!");

#if USE_MOCK_SENSORS
  randomSeed(analogRead(0));
  Serial.println("Using MOCK SENSOR DATA");
#endif

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect_mqtt();
  }
  client.loop();

  float temperature = mock_readTemperature();
  float humidity = mock_readHumidity();
  float co2 = mock_readCO2();
  int pm25 = mock_readPM25();

  StaticJsonDocument<256> jsonDoc;
  jsonDoc["temperature"] = temperature;
  jsonDoc["humidity"] = humidity;
  jsonDoc["co2"] = co2;
  jsonDoc["pm25"] = pm25;

  char jsonBuffer[256];
  serializeJson(jsonDoc, jsonBuffer); // Chuyển JSON object thành chuỗi

  // Gửi dữ liệu lên CoreIoT
  if (client.publish(telemetry_topic, jsonBuffer)) {
    Serial.print("Telemetry data sent: ");
    Serial.println(jsonBuffer);
  } else {
    Serial.println("Failed to send telemetry data.");
  }

  delay(10000);
}