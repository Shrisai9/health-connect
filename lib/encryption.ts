import crypto from 'crypto';

// Algorithm: AES-256-GCM (Authenticated Encryption)
const ALGORITHM = 'aes-256-gcm';

// Key: Must be 32 bytes (256 bits). 
// In production, store this in process.env.NEXT_PRIVATE_ENCRYPTION_KEY
const SECRET_KEY = Buffer.from(process.env.NEXT_PRIVATE_ENCRYPTION_KEY || '0000000000000000000000000000000000000000000000000000000000000000', 'hex');

interface EncryptedPayload {
  encryptedData: string;
  iv: string;
  authTag: string;
}

export const encryptData = (text: string): EncryptedPayload => {
  const iv = crypto.randomBytes(12); // Standard IV size for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
  };
};

export const decryptData = (encryptedData: string, iv: string, authTag: string): string => {
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, Buffer.from(iv, 'hex'));
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
