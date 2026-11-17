import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { db } from '../db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.resolve(__dirname, '../../backups');
const dbPath = path.resolve(__dirname, '../../data/pos_master.db');

// 32-byte key derived from store secret
const BACKUP_SECRET = crypto.scryptSync('WARUNG-KOPI-LUHUR-MASTER-KEY-2026', 'luhur-salt', 32);

export function createEncryptedBackup(): { success: boolean; filePath: string; sizeBytes: number } {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const tempCopyPath = path.join(backupDir, `temp_${timestamp}.db`);
  const encryptedFilePath = path.join(backupDir, `wkl_backup_${timestamp}.db.enc`);

  // Use SQLite online backup API via VACUUM INTO for crash-safe snapshot
  db.exec(`VACUUM INTO '${tempCopyPath.replace(/'/g, "''")}'`);

  const rawData = fs.readFileSync(tempCopyPath);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', BACKUP_SECRET, iv);
  const encrypted = Buffer.concat([iv, cipher.update(rawData), cipher.final()]);

  fs.writeFileSync(encryptedFilePath, encrypted);
  fs.unlinkSync(tempCopyPath); // remove unencrypted temp snapshot

  console.log(`[Backup Worker] Encrypted daily backup created: ${encryptedFilePath} (${encrypted.length} bytes)`);
  return {
    success: true,
    filePath: encryptedFilePath,
    sizeBytes: encrypted.length
  };
}

export function startDailyBackupScheduler() {
  // Run check every 1 hour; if no backup exists for today, create one
  setInterval(() => {
    const todayPrefix = `wkl_backup_${new Date().toISOString().slice(0, 10)}`;
    if (!fs.existsSync(backupDir)) {
      createEncryptedBackup();
      return;
    }
    const files = fs.readdirSync(backupDir);
    const hasTodayBackup = files.some(f => f.startsWith(todayPrefix));
    if (!hasTodayBackup) {
      createEncryptedBackup();
    }
  }, 60 * 60 * 1000);
}

