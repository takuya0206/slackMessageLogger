import { Slack } from './app/slack.service';
import { Properties } from './model/properties';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let global: any;

global.getSlackChannels = async (): Promise<void> => {
  const p = new Properties();
  const slack = new Slack(p.getSlackToken())
  console.log(await slack.getAllSlackUsers())
};
