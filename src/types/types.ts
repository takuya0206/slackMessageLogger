export interface slackChannelProp {
  id: string;
  name: string;
}

export interface slackUserProp {
  id: string;
  name: string;
  deleted: boolean;
  profile: {
    real_name: string;
    display_name: string;
  };
}

// https://api.slack.com/events/message
// defined only necessary properties
export interface slackMessageProp {
  type: string;
  subtype?: string;
  text: string;
  user: string;
  ts: string;
  reactions?: {
    name: string;
    users: string[];
    count: number;
  }[];
  thread_ts?: string;
  reply_count?: number;
  reply_users_count?: number;
  reply_users?: string[];
  bot_id?: string;
}

export interface loggingMessageProp {
  ts: string;
  post_at: string;
  channel: string;
  post_by: string;
  text: string;
  type: 'message' | 'reply';
}

export interface loggingMentionProp extends loggingMessageProp {
  toWhom: string;
}
