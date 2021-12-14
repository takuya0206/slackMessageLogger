/**********************************
howdy39 / gas-clasp-starter
https://github.com/howdy39/gas-clasp-starter


Copyright (c) 2018 Tatsuya Nakano. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*********************************/

import Spreadsheet = GoogleAppsScript.Spreadsheet;
import { Slack } from './app/slack.service';
import { convertAryObjToMultiAry, convertUserIdToName, getTalkToWhom } from './app/util'
import { Properties } from './model/properties';
import { loggingMessageProp, loggingMentionProp } from './types/types'
import { outputSpreadsheetInfo } from './app/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let global: any;

global.logSlackMessages = async (): Promise<void> => {
  const p = new Properties();
  const ss: Spreadsheet.Spreadsheet = SpreadsheetApp.openById(outputSpreadsheetInfo.id);
  const slack = new Slack(p.getSlackToken())
  const users = await slack.getAllSlackUsers()
  const channels = await slack.getAllSlackChannels()
  const loggingMessage: loggingMessageProp[] = []
  const loggingMention: loggingMentionProp[] = []

  await Promise.all(channels.map( async (channel) => {
    const messages = await slack.getSlackMessagesWithin24hours(channel.id)
    let allReplies = []
    await Promise.all(messages.map(async (message) => {
      if(message.reply_count > 0) {
        const replies = await slack.getAllSlackReplies(channel.id, message.ts)
        replies.shift() // Because reply array include messages which create its threads
        allReplies = allReplies.concat(replies)
      }
    }))
    return { channelName: channel.name, messages: messages.concat(allReplies)}
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
              channel: channelMessage.channelName,
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
                  channel: channelMessage.channelName,
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

    if(loggingMessage.length !== 0) {
      const loggingMessageInAry = convertAryObjToMultiAry(loggingMessage)
    let messageSheet = ss.getSheetByName(outputSpreadsheetInfo.messageSheet)
    let messageSheetStartRow: number = 1
    if(!messageSheet){
      messageSheet = ss.insertSheet(outputSpreadsheetInfo.messageSheet)
      messageSheet = ss.getSheetByName(outputSpreadsheetInfo.messageSheet)
      messageSheet.deleteColumns(loggingMessageInAry[0].length, messageSheet.getMaxColumns()-loggingMessageInAry[0].length)
    } else {
      // when there is existing data, delete header and add below
      loggingMessageInAry.shift()
      messageSheetStartRow = messageSheet.getLastRow() + 1
    }
    messageSheet.getRange(messageSheetStartRow, 1, loggingMessageInAry.length, loggingMessageInAry[0].length).setValues(loggingMessageInAry)
    } else {
      console.log('There is no message.')
    }

    if(loggingMention.length !== 0) {
      const loggingMentionInAry = convertAryObjToMultiAry(loggingMention)
    let mentionSheet = ss.getSheetByName(outputSpreadsheetInfo.mentionSheet)
    let mentionSheetStartRow: number = 1
    if(!mentionSheet){
      mentionSheet = ss.insertSheet(outputSpreadsheetInfo.mentionSheet)
      mentionSheet = ss.getSheetByName(outputSpreadsheetInfo.mentionSheet)
      mentionSheet.deleteColumns(loggingMentionInAry[0].length, mentionSheet.getMaxColumns()-loggingMentionInAry[0].length)
    } else {
      // when there is existing data, delete header and add below
      loggingMentionInAry.shift()
      mentionSheetStartRow = mentionSheet.getLastRow() + 1
    }
    mentionSheet.getRange(mentionSheetStartRow, 1, loggingMentionInAry.length, loggingMentionInAry[0].length).setValues(loggingMentionInAry)
    } else {
      console.log('There is no mention.')
    }
  })
};
