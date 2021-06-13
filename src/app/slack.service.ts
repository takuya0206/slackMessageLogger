import { slackChannelProp, slackUserProp } from '../types/types';
import { Properties } from '../model/properties';

export class Slack {
  private slackAPIURL: string;
  private slackToken: string;

  constructor(slackToken: string) {
    this.slackAPIURL = 'https://slack.com/api';
    this.slackToken = slackToken;
  }

  async getAllSlackChannels(pagination = ''): Promise<slackChannelProp[]> {
    let isNextCursor = true;
    let result = [];
    while (isNextCursor) {
      const res = UrlFetchApp.fetch(
        `${this.slackAPIURL}/conversations.list?token=${this.slackToken}&limit=1000&exclude_archived=true&pretty=1${pagination}`
      );
      const resInParse = JSON.parse(res.getContentText());
      result = result.concat(resInParse.channels);
      if (resInParse.response_metadata.next_cursor === '') {
        isNextCursor = false;
      } else {
        pagination = `&cursor=${resInParse.response_metadata.next_cursor}`;
        Utilities.sleep(100);
      }
    }
    return result;
  }

  async getAllSlackUsers(pagination = ''): Promise<slackUserProp[]> {
    let isNextCursor = true;
    let result = [];
    while (isNextCursor) {
      const res = UrlFetchApp.fetch(
        `${this.slackAPIURL}/users.list?token=${this.slackToken}&limit=1000&pretty=1${pagination}`
      );
      const resInParse = JSON.parse(res.getContentText());
      result = result.concat(resInParse.members);
      if (resInParse.response_metadata.next_cursor === '') {
        isNextCursor = false;
      } else {
        pagination = `&cursor=${resInParse.response_metadata.next_cursor}`;
        Utilities.sleep(100);
      }
    }
    return result;
  }
}
