import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';
import multer from 'multer';
import { PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET } from '../config/s3.js';
import mqttService from '../config/mqtt.js';

export const getAllUsers = async (req, res) => {
  try {
    // Select companyId as well for filtering
    const users = await User.find({}, ' villaId username companyId checkinDate checkoutDate access');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUser =  async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { checkinDate, checkoutDate, access, username, password, faceRegistration } = req.body; // <-- add faceRegistration

    // Build update object
    const updateFields = {};
    if (checkinDate) updateFields.checkinDate = checkinDate;
    if (checkoutDate) updateFields.checkoutDate = checkoutDate;
    if (access !== undefined) updateFields.access = access;
    if (username) updateFields.username = username;
    if (faceRegistration !== undefined) updateFields.faceRegistration = faceRegistration; // <-- allow update

    // If password is provided, hash it and update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Multer in-memory storage for image uploads
const upload = multer({ storage: multer.memoryStorage() });

// Upload face images to S3 and notify Raspberry Pi
export const uploadFaceImages = [
  upload.array('images', 10),
  async (req, res) => {
    try {
      const username = req.headers['nic'] || req.body.username;
      if (!username) {
        return res.status(400).json({ message: 'Missing username header or body' });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
      }

      const uploadedUrls = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const key = `faces/${username}/face_${Date.now()}_${i}.png`;
        const cmd = new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype || 'image/png',
        });
        await s3Client.send(cmd);
        uploadedUrls.push(`s3://${S3_BUCKET}/${key}`);
      }

      // Notify Raspberry Pi via MQTT or HTTP fallback
      const useMQTT = process.env.MQTT_ENABLED === 'true';
      const useHTTP = process.env.RPI_ENABLED === 'true';
      
      if (!useMQTT && !useHTTP) {
        return res.status(200).json({ message: 'Images uploaded (Raspberry Pi notification skipped)', uploaded: uploadedUrls, rpi: { skipped: true } });
      }

      let rpiResponse = { skipped: true };

      try {
        if (useMQTT && mqttService.isConnected) {
          // Use MQTT for Raspberry Pi communication
          rpiResponse = await mqttService.publishFaceRegister(username, uploadedUrls);
          return res.status(200).json({ message: 'Images uploaded and Raspberry Pi notified via MQTT', uploaded: uploadedUrls, rpi: rpiResponse });
        } else if (useHTTP) {
          // Fallback to HTTP
          const rpiUrl = process.env.RPI_REGISTER_URL;
          if (!rpiUrl) {
            return res.status(500).json({ message: 'Raspberry Pi URL not configured' });
          }

          const rpiResp = await fetch(rpiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: username, image_urls: uploadedUrls }),
          });

          if (!rpiResp.ok) {
            const text = await rpiResp.text();
            return res.status(502).json({ message: 'Raspberry Pi registration failed', detail: text, uploaded: uploadedUrls });
          }

          rpiResponse = await rpiResp.json().catch(() => ({}));
          return res.status(200).json({ message: 'Images uploaded and Raspberry Pi notified via HTTP', uploaded: uploadedUrls, rpi: rpiResponse });
        }
      } catch (error) {
        console.error('Raspberry Pi notification error:', error);
        return res.status(502).json({ message: 'Raspberry Pi notification failed', detail: error.message, uploaded: uploadedUrls });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
];

// Delete all face images for a user from S3 and notify Raspberry Pi
export const deleteFaceImages = async (req, res) => {
  try {
    const username = req.headers['nic'] || req.body.username;
    if (!username) {
      return res.status(400).json({ message: 'Missing username header or body' });
    }

    const prefix = `faces/${username}/`;
    const listed = await s3Client.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix }));

    if (listed.Contents && listed.Contents.length > 0) {
      const objects = listed.Contents.map((o) => ({ Key: o.Key }));
      await s3Client.send(new DeleteObjectsCommand({ Bucket: S3_BUCKET, Delete: { Objects: objects } }));
    }

    // Notify Raspberry Pi via MQTT or HTTP fallback
    const useMQTT = process.env.MQTT_ENABLED === 'true';
    const useHTTP = process.env.RPI_ENABLED === 'true';
    
    if (!useMQTT && !useHTTP) {
      return res.status(200).json({ message: 'Faces deleted from S3; Raspberry Pi notification skipped', deletedPrefix: prefix });
    }

    try {
      if (useMQTT && mqttService.isConnected) {
        // Use MQTT for Raspberry Pi communication
        const rpiResponse = await mqttService.publishFaceDelete(username);
        return res.status(200).json({ message: 'Faces deleted and Raspberry Pi notified via MQTT', deletedPrefix: prefix, rpi: rpiResponse });
      } else if (useHTTP) {
        // Fallback to HTTP
        const base = process.env.RPI_DELETE_URL;
        if (!base) {
          return res.status(200).json({ message: 'Faces deleted from S3; Raspberry Pi URL not configured', deletedPrefix: prefix });
        }

        let url = base;
        if (url.includes('{username}')) {
          url = url.replace('{username}', encodeURIComponent(username));
        } else {
          url = url.endsWith('/') ? `${url}delete_user/${encodeURIComponent(username)}` : `${url}/delete_user/${encodeURIComponent(username)}`;
        }

        const rpiResp = await fetch(url, { method: 'DELETE' });
        if (!rpiResp.ok) {
          const text = await rpiResp.text();
          return res.status(502).json({ message: 'Raspberry Pi delete failed', detail: text });
        }

        return res.status(200).json({ message: 'Faces deleted and Raspberry Pi notified via HTTP', deletedPrefix: prefix });
      }
    } catch (error) {
      console.error('Raspberry Pi delete notification error:', error);
      return res.status(502).json({ message: 'Raspberry Pi delete notification failed', detail: error.message, deletedPrefix: prefix });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};