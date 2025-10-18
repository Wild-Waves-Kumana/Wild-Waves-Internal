import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { publish } from '../notifications/mqtt.js';
import path from 'path';

dotenv.config();

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.S3_BUCKET;

const s3 = new S3Client({ region: REGION });

function safeFilename(name) {
  return name.replace(/[^a-z0-9_.-]/gi, '_');
}

export const registerFaces = async (req, res) => {
  try {
    // authenticate middleware should populate req.user with id
    const userId = (req.user && (req.user.id || req.user.userId)) || req.body.userId;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    if (req.files.length !== 5) {
      return res.status(400).json({ message: 'Exactly 5 images are required' });
    }

    const uploadedUrls = [];
    // upload each file buffer to S3
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const ext = path.extname(file.originalname) || '.png';
      const key = `faces/${userId}/face_${i + 1}${ext}`;

      const params = {
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(params));

      // Construct URL — supports virtual-hosted–style
      const url = REGION && REGION.startsWith('us-')
        ? `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`
        : `https://${BUCKET}.s3.amazonaws.com/${key}`;

      uploadedUrls.push(url);
    }

    // Publish MQTT message
    const topic = process.env.MQTT_TOPIC || 'wildwaves/faces';
    const message = {
      event: 'new_face_registered',
      user_id: userId,
      image_urls: uploadedUrls,
    };
    publish(topic, message);

    return res.status(201).json({ uploaded: uploadedUrls });
  } catch (err) {
    console.error('registerFaces error', err);
    return res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};
