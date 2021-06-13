export class Properties {
  private SLACK_TOKEN: string;

  constructor() {
    this.SLACK_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_TOKEN');
  }
  getSlackToken(): string {
    return this.SLACK_TOKEN;
  }
}
