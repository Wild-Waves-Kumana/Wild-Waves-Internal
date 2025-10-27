import { initMqtt, publish } from '../notifications/mqtt.js';

let client = null;
try {
  if (!(process.env.MQTT_ENABLED && process.env.MQTT_ENABLED.toLowerCase() === 'false')) {
    client = initMqtt();
  } else {
    console.log('MQTT disabled via MQTT_ENABLED=false');
  }
} catch (err) {
  console.warn('MQTT init failed:', err.message || err);
}

const mqttService = {
  get isConnected() {
    return client && client.connected;
  },
  async publishFaceRegister(username, uploadedUrls) {
    const topic = process.env.MQTT_TOPIC || 'wildwaves/faces';
    const message = { event: 'new_face_registered', user_id: username, image_urls: uploadedUrls };
    publish(topic, message);
    return { published: true };
  },
  async publishFaceDelete(username) {
    const topic = process.env.MQTT_TOPIC || 'wildwaves/faces';
    const message = { event: 'face_deleted', user_id: username };
    publish(topic, message);
    return { published: true };
  },
  async publishDoorLock(doorId, lockStatus, doorName, roomName) {
    const topic = process.env.MQTT_TOPIC || 'wildwaves/faces';
    const message = { 
      event: 'door_lock_changed', 
      door_id: doorId,
      lock_status: lockStatus,
      door_name: doorName,
      room_name: roomName,
      timestamp: new Date().toISOString()
    };
    console.log(`📤 Publishing MQTT message to topic ${topic}:`, message);
    const result = publish(topic, message);
    console.log(`📤 MQTT publish result:`, result);
    return { published: result };
  }
};

export default mqttService;
