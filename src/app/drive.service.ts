import { Properties } from '../model/properties';
import { persistentPropertyType } from '../types/types';

export class Drive {
  createPersistentProperty(value = '{}'): string {
    const p = new Properties();
    const file = DriveApp.createFile('PersistentPropertyForSlackMessageLogger', value);
    const fileId = file.getId();
    p.setFileId(fileId);
    return fileId;
  }

  async readPersistentProperty(): Promise<persistentPropertyType> {
    const p = new Properties();
    const fileId = p.getFileId();
    try {
      const file = DriveApp.getFileById(fileId);
      if (!file.isTrashed()) {
        const fileValue = file.getBlob().getDataAsString();
        return JSON.parse(fileValue);
      } else {
        console.log('File is trashed.');
      }
    } catch (e) {
      console.log(`Error: can't get persistent property → ${e}.`);
    }
  }

  savePersistentProperty(value: string): void {
    const p = new Properties();
    const fileId = p.getFileId();
    DriveApp.getFileById(fileId).setContent(value);
  }
}
