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
