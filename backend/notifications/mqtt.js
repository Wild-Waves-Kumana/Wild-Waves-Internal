import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

let client = null;

export function initMqtt() {
  if (client) return client;
  // Allow disabling MQTT entirely via MQTT_ENABLED=false
  if (process.env.MQTT_ENABLED && process.env.MQTT_ENABLED.toLowerCase() === 'false') {
    console.log('MQTT disabled via MQTT_ENABLED=false');
    return null;
  }
  let brokerUrl = process.env.MQTT_BROKER_URL; // e.g. mqtts://<host>:8883
  if (!brokerUrl) {
    console.warn('MQTT_BROKER_URL not set — MQTT publish will be a no-op');
    return null;
  }
  // If user provided host without protocol (common), assume secure MQTT (mqtts)
  if (!/^mqtts?:\/\//i.test(brokerUrl)) {
    brokerUrl = `mqtts://${brokerUrl}`;
    //console.log('MQTT: prepended mqtts:// to broker URL, using', brokerUrl);
  }
  const options = {};
  if (process.env.MQTT_USERNAME) options.username = process.env.MQTT_USERNAME;
  if (process.env.MQTT_PASSWORD) options.password = process.env.MQTT_PASSWORD;

  client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log('MQTT connected to', brokerUrl , '✅');
  });
  client.on('error', (err) => {
    // Common causes: unreachable broker, wrong URL/port, network issues, firewall or security groups blocking outbound
    console.error('MQTT error', err.message || err);
    console.error('If this is EHOSTUNREACH, check your MQTT_BROKER_URL, network connectivity, and EC2 security group/outbound rules.');
  });

  return client;
}

export function publish(topic, message) {
  if (!client) initMqtt();
  if (!client) return false;
  const payload = typeof message === 'string' ? message : JSON.stringify(message);
  client.publish(topic, payload, { qos: 0 }, (err) => {
    if (err) console.error('MQTT publish error', err.message || err);
  });
  return true;
}
