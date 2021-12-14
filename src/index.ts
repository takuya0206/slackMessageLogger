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
  const targetDate = dayjs.dayjs().subtract(1, 'day') // assuming that trigger in GAS will set every day
  const searchOldestDate = targetDate.subtract(2, 'week') // In order to find messages in threads, prepare some buffers. This is for messages in threads which are created on older date than target date
  const loggingMessage: loggingMessageProp[] = []
  const loggingMention: loggingMentionProp[] = []

  await Promise.all(channels.map( async (channel) => {
    Utilities.sleep(1500) // Because conversations which has Tier 3 limit can be called 50 times per minute. https://api.slack.com/docs/rate-limits
    const messages = await slack.getSlackMessagesFromSpecificDate(channel.id, searchOldestDate)
    let allReplies = []
    await Promise.all(messages.map(async (message) => {
      // In case, need to specify range
      // const post_at = dayjs.dayjs(parseInt(message.ts) * 1000)
      // if(message.reply_count > 0 && dayjs.dayjs('').isAfter(post_at, 'day'))
      if(message.reply_count > 0 ) {
        Utilities.sleep(1500) // Because conversations which has Tier 3 limit can be called 50 times per minute. https://api.slack.com/docs/rate-limits
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
            const post_at = dayjs.dayjs(parseInt(message.ts) * 1000)
            if(targetDate.isBefore(post_at, 'day') || targetDate.isSame(post_at, 'day')){ // true when targetDate is 2000-01-01 and post_at is 2000-01-02
              const post_by = await convertUserIdToName(users, message.user)
              const type = message.reply_count ? 'reply' : 'message'
              loggingMessage.push({
                ts: message.ts,
                post_at: post_at.format('YYYY/MM/DD'),
                channel: channelMessage.channelName,
                post_by,
                text: message.text,
                type,
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
                    post_at: post_at.format('YYYY/MM/DD'),
                    channel: channelMessage.channelName,
                    post_by,
                    text: message.text,
                    type,
                    toWhom,
                  })
                }
              })
            }
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