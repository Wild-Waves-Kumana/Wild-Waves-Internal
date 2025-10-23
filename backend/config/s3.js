import dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';

dotenv.config();

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
const S3_BUCKET = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET;

const s3Client = new S3Client({ region: REGION });

export { s3Client, S3_BUCKET };
