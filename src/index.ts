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
import { convertAryObjToMultiAry, convertUserIdToUserInfo, getTalkToWhom, findNewRepliesWithPersistentProperty } from './app/util'
import { Properties } from './model/properties';
import { Drive } from './app/drive.service'
import { loggingMessageProp, loggingMentionProp, persistentPropertyType } from './types/types'
import { outputSpreadsheetInfo } from './app/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let global: any;

global.logSlackMessages = async (): Promise<void> => {
  const p = new Properties();
  const d = new Drive()
  const updatedPersistentProperty: persistentPropertyType = {}
  const persistentProperty: persistentPropertyType = await d.readPersistentProperty();
  const ss: Spreadsheet.Spreadsheet = SpreadsheetApp.openById(outputSpreadsheetInfo.id);
  const slack = new Slack(p.getSlackToken())
  const users = await slack.getAllSlackUsers()
  const channels = await slack.getAllSlackChannels()
  const targetDate = dayjs.dayjs().subtract(1, 'day') // assuming that trigger in GAS will set every day
  const searchOldestDate = targetDate.subtract(10, 'day') // In order to find messages in previous threads, prepare some buffers. This is for messages in threads which are created on older date than target date
  const loggingMessage: loggingMessageProp[] = []
  const loggingMention: loggingMentionProp[] = []

  if(!persistentProperty) {
    d.createPersistentProperty();
    console.log('Create a new persistent property.');
  }

  await Promise.all(channels.map( async (channel) => {
    Utilities.sleep(1200) // Because conversations which has Tier 3 limit can be called 50 times per minute. https://api.slack.com/docs/rate-limits
    const messages = await slack.getSlackMessagesFromSpecificDate(channel.id, searchOldestDate)
    const updatedOrNewMessages = await findNewRepliesWithPersistentProperty(messages, persistentProperty)
    let allReplies = []
    await Promise.all(updatedOrNewMessages.map(async (message) => {
      // In case, need to specify range
      // const post_at = dayjs.dayjs(parseInt(message.ts) * 1000)
      // if(message.reply_count > 0 && dayjs.dayjs('').isAfter(post_at, 'day'))
      if(message.reply_count > 0 ) {
        Utilities.sleep(1200) // Because conversations which has Tier 3 limit can be called 50 times per minute. https://api.slack.com/docs/rate-limits
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
            if(targetDate.isSame(post_at, 'day')){ // assuming that trigger in GAS will set every day
              const post_by = await convertUserIdToUserInfo(users, message.user)
              const type = message.reply_count ? 'reply' : 'message'
              loggingMessage.push({
                ts: message.ts,
                post_at: post_at.format('YYYY/MM/DD'),
                channel: channelMessage.channelName,
                post_by: post_by ? post_by.email : null,
                text: message.text,
                type,
              })
              // log messages with each user whom someone mentions
              const talkToWhoms = getTalkToWhom(message.text)
              talkToWhoms.map( async (talkToWhom) => {
                const toWhom = await convertUserIdToUserInfo(users, talkToWhom)
                if(!toWhom){
                  console.log(`Error: ${talkToWhom} doesn't exist in our user list.`)
                } else {
                  loggingMention.push({
                    ts: message.ts,
                    post_at: post_at.format('YYYY/MM/DD'),
                    channel: channelMessage.channelName,
                    post_by: post_by ? post_by.email : null,
                    text: message.text,
                    type,
                    toWhom: toWhom ? toWhom.email : null
                  })
                }
              })
            }
            // save into persistent property
            // Assume that targetDate is yesterday. Slack API includes messages today. But, if persistent property includes today, script doesn't work property tomorrow.
            if(!dayjs.dayjs().isSame(post_at, 'day')) {
              updatedPersistentProperty[message.ts] = {
                ts: message.ts,
                reply_count: message.reply_count,
                post_at: post_at.format('YYYY/MM/DD')
              }
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

    d.savePersistentProperty(JSON.stringify(updatedPersistentProperty))
  })
};