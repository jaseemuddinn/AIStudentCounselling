import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

class S3Service {
    constructor() {
        this.client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        this.bucketName = process.env.AWS_S3_BUCKET_NAME;

        if (!this.bucketName) {
            console.warn('AWS_S3_BUCKET_NAME not set - file upload will not work');
        }
    }

    /**
     * Upload a file to S3
     * @param {Buffer} fileBuffer - File buffer
     * @param {string} fileName - Original file name
     * @param {string} mimeType - File MIME type
     * @param {string} folder - Folder path in S3 (e.g., 'profiles', 'documents')
     * @returns {Promise<{key: string, url: string}>}
     */
    async uploadFile(fileBuffer, fileName, mimeType, folder = 'uploads') {
        try {
            const fileExtension = fileName.split('.').pop();
            const uniqueFileName = `${uuidv4()}.${fileExtension}`;
            const key = `${folder}/${uniqueFileName}`;

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: fileBuffer,
                ContentType: mimeType,
                // ACL: 'public-read', // Uncomment if you want files to be publicly accessible
            });

            await this.client.send(command);

            const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

            return {
                key,
                url,
            };
        } catch (error) {
            console.error('S3 Upload Error:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    /**
     * Delete a file from S3
     * @param {string} key - S3 object key
     * @returns {Promise<boolean>}
     */
    async deleteFile(key) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.client.send(command);
            return true;
        } catch (error) {
            console.error('S3 Delete Error:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * Generate a pre-signed URL for secure file access
     * @param {string} key - S3 object key
     * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
     * @returns {Promise<string>}
     */
    async getSignedUrl(key, expiresIn = 3600) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const url = await getSignedUrl(this.client, command, { expiresIn });
            return url;
        } catch (error) {
            console.error('S3 GetSignedUrl Error:', error);
            throw new Error(`Failed to generate signed URL: ${error.message}`);
        }
    }

    /**
     * Upload profile picture
     * @param {Buffer} fileBuffer
     * @param {string} fileName
     * @param {string} mimeType
     * @param {string} userId
     * @returns {Promise<{key: string, url: string}>}
     */
    async uploadProfilePicture(fileBuffer, fileName, mimeType, userId) {
        return this.uploadFile(fileBuffer, fileName, mimeType, `profiles/${userId}`);
    }

    /**
     * Upload student document
     * @param {Buffer} fileBuffer
     * @param {string} fileName
     * @param {string} mimeType
     * @param {string} userId
     * @returns {Promise<{key: string, url: string}>}
     */
    async uploadDocument(fileBuffer, fileName, mimeType, userId) {
        return this.uploadFile(fileBuffer, fileName, mimeType, `documents/${userId}`);
    }

    /**
     * Extract S3 key from URL
     * @param {string} url
     * @returns {string|null}
     */
    extractKeyFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            return pathname.startsWith('/') ? pathname.slice(1) : pathname;
        } catch (error) {
            console.error('Invalid URL:', error);
            return null;
        }
    }
}

// Singleton instance
let s3ServiceInstance = null;

export function getS3Service() {
    if (!s3ServiceInstance) {
        s3ServiceInstance = new S3Service();
    }
    return s3ServiceInstance;
}

export default S3Service;
