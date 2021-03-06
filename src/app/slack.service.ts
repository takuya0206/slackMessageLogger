import { slackChannelProp, slackUserProp, slackMessageProp } from '../types/types';

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
    try {
      while (isNextCursor) {
        const res = UrlFetchApp.fetch(
          `${this.slackAPIURL}/conversations.list?token=${this.slackToken}&limit=200&exclude_archived=true&pretty=1${pagination}`
        );
        const resInParse = JSON.parse(res.getContentText());
        result = result.concat(resInParse.channels);
        if (resInParse.response_metadata && resInParse.response_metadata.next_cursor) {
          pagination = `&cursor=${resInParse.response_metadata.next_cursor}`;
          Utilities.sleep(100);
        } else {
          isNextCursor = false;
        }
      }
      return result;
    } catch (e) {
      console.error(`Failed getting slack channels -> ${e}`);
      return result;
    }
  }

  async getAllSlackUsers(pagination = ''): Promise<slackUserProp[]> {
    let isNextCursor = true;
    let result = [];
    try {
      while (isNextCursor) {
        const res = UrlFetchApp.fetch(
          `${this.slackAPIURL}/users.list?token=${this.slackToken}&limit=200&pretty=1${pagination}`
        );
        const resInParse = JSON.parse(res.getContentText());
        result = result.concat(resInParse.members);
        if (resInParse.response_metadata && resInParse.response_metadata.next_cursor) {
          pagination = `&cursor=${resInParse.response_metadata.next_cursor}`;
          Utilities.sleep(100);
        } else {
          isNextCursor = false;
        }
      }
      return result;
    } catch (e) {
      console.error(`Failed getting slack users -> ${e}`);
      return result;
    }
  }

  async getSlackMessagesFromSpecificDate(
    channel: string,
    dateInDayjs: dayjs.Dayjs,
    pagination = ''
  ): Promise<slackMessageProp[]> {
    const oldest = dateInDayjs.unix();
    let isNextCursor = true;
    let result = [];
    try {
      while (isNextCursor) {
        const res = UrlFetchApp.fetch(
          `${this.slackAPIURL}/conversations.history?token=${this.slackToken}&channel=${channel}&oldest=${oldest}&limit=200&pretty=1${pagination}`
        );
        const resInParse = JSON.parse(res.getContentText());
        result = result.concat(resInParse.messages);
        if (resInParse.response_metadata && resInParse.response_metadata.next_cursor) {
          pagination = `&cursor=${resInParse.response_metadata.next_cursor}`;
          Utilities.sleep(100);
        } else {
          isNextCursor = false;
        }
      }
      return result;
    } catch (e) {
      console.error(`Failed getting slack messages -> ${e}`);
      return result;
    }
  }

  async getAllSlackReplies(
    channel: string,
    ts: string,
    pagination = ''
  ): Promise<slackMessageProp[]> {
    let isNextCursor = true;
    let result = [];
    try {
      while (isNextCursor) {
        const res = UrlFetchApp.fetch(
          `${this.slackAPIURL}/conversations.replies?token=${this.slackToken}&channel=${channel}&ts=${ts}&limit=200&pretty=1${pagination}`
        );
        const resInParse = JSON.parse(res.getContentText());
        result = result.concat(resInParse.messages);
        if (resInParse.response_metadata && resInParse.response_metadata.next_cursor) {
          pagination = `&cursor=${resInParse.response_metadata.next_cursor}`;
          Utilities.sleep(100);
        } else {
          isNextCursor = false;
        }
      }
      return result;
    } catch (e) {
      console.error(`Failed getting slack replies -> ${e}`);
      return result;
    }
  }
}
