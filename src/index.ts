
import Spreadsheet = GoogleAppsScript.Spreadsheet;
import { Slack } from './app/slack.service';
import { convertAryObjToMultiAry, convertUserIdToName, getTalkToWhom } from './app/util'
import { Properties } from './model/properties';
import { loggingMessageProp, loggingMentionProp } from './types/types'
import { outputSpreadsheetInfo } from './app/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let global: any;

global.getSlackChannels = async (): Promise<void> => {
  const p = new Properties();
  const ss: Spreadsheet.Spreadsheet = SpreadsheetApp.openById(outputSpreadsheetInfo.id);
  const slack = new Slack(p.getSlackToken())
  const users = await slack.getAllSlackUsers()
  const channels = await slack.getAllSlackChannels()
  const loggingMessage: loggingMessageProp[] = []
  const loggingMention: loggingMentionProp[] = []

  await Promise.all(channels.map( async (channel) => {
    Utilities.sleep(100)
    const messages = await slack.getSlackMessagesWithin24hours(channel.id)
    return { channel: channel.name, messages }
  })).then(async (channelMessages) => {
    await Promise.all(channelMessages.map( async (channelMessage) => {
      if(channelMessage.messages.length > 0) {
        channelMessage.messages.map(async (message) => {
          if(!message.subtype && !message.bot_id){
            const post_at = dayjs.dayjs(parseInt(message.ts) * 1000).format('YYYY-MM-DD')
            const post_by = await convertUserIdToName(users, message.user)
            const thread_ts = message.thread_ts ? message.thread_ts : ''
            loggingMessage.push({
              ts: message.ts,
              post_at,
              channel: channelMessage.channel,
              post_by,
              text: message.text,
              thread_ts,
            })
            // log messages with each user whom someone mentions
            const talkToWhoms = getTalkToWhom(message.text)
            talkToWhoms.map( async (talkToWhom) => {
              const toWhom = await convertUserIdToName(users, talkToWhom)
              if(!toWhom){
                console.log(`Error: ${talkToWhom} doesn't exist in our user list.`)
              } else {
                loggingMention.push({
                  ts: message.ts,
                  post_at,
                  channel: channelMessage.channel,
                  post_by,
                  text: message.text,
                  thread_ts,
                  toWhom,
                })
              }
            })
          }
        })
      }
    }))
    console.log(loggingMessage)
    console.log(loggingMention)
    const loggingMessageInAry = convertAryObjToMultiAry(loggingMessage)
    let messageSheet = ss.getSheetByName(outputSpreadsheetInfo.messageSheet)
    let messageSheetStartRow: number = 1
    if(!messageSheet){
      messageSheet = ss.insertSheet(outputSpreadsheetInfo.messageSheet)
      messageSheet = ss.getSheetByName(outputSpreadsheetInfo.messageSheet)
    } else {
      // when there is existing data, delete header and add below
      loggingMessageInAry.shift()
      messageSheetStartRow = messageSheet.getLastRow() + 1
    }
    messageSheet.getRange(messageSheetStartRow, 1, loggingMessageInAry.length, loggingMessageInAry[0].length).setValues(loggingMessageInAry)

    const loggingMentionInAry = convertAryObjToMultiAry(loggingMention)
    let mentionSheet = ss.getSheetByName(outputSpreadsheetInfo.mentionSheet)
    let mentionSheetStartRow: number = 1
    if(!mentionSheet){
      mentionSheet = ss.insertSheet(outputSpreadsheetInfo.mentionSheet)
      mentionSheet = ss.getSheetByName(outputSpreadsheetInfo.mentionSheet)
    } else {
      // when there is existing data, delete header and add below
      loggingMentionInAry.shift()
      mentionSheetStartRow = mentionSheet.getLastRow() + 1
    }
    mentionSheet.getRange(mentionSheetStartRow, 1, loggingMentionInAry.length, loggingMentionInAry[0].length).setValues(loggingMentionInAry)


  })
};
