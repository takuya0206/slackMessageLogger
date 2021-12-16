export class Properties {
  private SLACK_TOKEN: string;
  private FILE_ID: string;

  constructor() {
    this.SLACK_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_TOKEN');
    this.FILE_ID = PropertiesService.getScriptProperties().getProperty('FILE_ID');
  }
  getSlackToken(): string {
    return this.SLACK_TOKEN;
  }

  getFileId(): string {
    return this.FILE_ID;
  }

  setFileId(fileId: string): void {
    PropertiesService.getScriptProperties().setProperties({ FILE_ID: fileId });
  }
}
