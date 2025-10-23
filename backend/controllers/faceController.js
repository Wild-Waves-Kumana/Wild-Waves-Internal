import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { publish } from '../notifications/mqtt.js';
import path from 'path';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config();

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.S3_BUCKET;

const s3 = new S3Client({ region: REGION });
const PRESIGNED_URL_EXPIRES = parseInt(process.env.PRESIGNED_URL_EXPIRES || '900', 10); // seconds

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

      // Create a presigned GET URL so the receiver can download the object even if the bucket is private
      const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
      const signedUrl = await getSignedUrl(s3, getCmd, { expiresIn: PRESIGNED_URL_EXPIRES });
      uploadedUrls.push(signedUrl);
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

export const deleteFaces = async (req, res) => {
  try {
    const userId = (req.user && (req.user.id || req.user.userId)) || req.params.userId || req.body.userId;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const prefix = `faces/${userId}/`;
    // list objects
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix }));

    if (!listed.Contents || listed.Contents.length === 0) {
      return res.status(200).json({ message: 'No face objects found', deleted: 0 });
    }

    const objects = listed.Contents.map((o) => ({ Key: o.Key }));
    await s3.send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: objects } }));

    // publish delete message
    const topic = process.env.MQTT_TOPIC || 'wildwaves/faces';
    const message = { event: 'face_deleted', user_id: userId };
    publish(topic, message);

    return res.status(200).json({ message: 'Deleted face objects', deleted: objects.length });
  } catch (err) {
    console.error('deleteFaces error', err);
    return res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
