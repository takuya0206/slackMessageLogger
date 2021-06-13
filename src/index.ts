import { Slack } from './app/slack.service';
import { convertUserIdToDisplayName } from './app/util'
import { Properties } from './model/properties';
import { loggingMessageProp } from './types/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let global: any;

global.getSlackChannels = async (): Promise<void> => {
  const p = new Properties();
  const slack = new Slack(p.getSlackToken())
  const users = await slack.getAllSlackUsers()
  const channels = await slack.getAllSlackChannels()
  const loggingMessage: loggingMessageProp[] = []

  await Promise.all(channels.map( async (channel) => {
    const messages = await slack.getSlackMessagesWithin24hours(channel.id)
    return { channel: channel.name, messages }
  })).then(async (channelMessages) => {
    await Promise.all(channelMessages.map( async (channelMessage) => {
      if(channelMessage.messages.length > 0) {
        channelMessage.messages.map((message) => {
          if(!message.subtype && !message.bot_id){
            loggingMessage.push({
              ts: message.ts,
              post_at: dayjs.dayjs(parseInt(message.ts) * 1000).format('YYYY-MM-DD'),
              channel: channelMessage.channel,
              post_by: convertUserIdToDisplayName(users, message.user),
              text: message.text,
              thread_ts: message.thread_ts ? message.thread_ts : '',
            })
          }
        })
      }
    }))
    console.log(loggingMessage)
  })
};
