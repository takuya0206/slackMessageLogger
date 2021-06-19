# Slack Message Logger
This is a tool for logging slack messages with Google Spreadsheet in order to allow you to analyze communication in the workplace.

## What You Can Do
By using this, you can analyze communication in your Slack workspace such as how active each channel is, who is mentioned the most, whom a member mentions, etc. For example, you can utilize it to know how onboarding is going well.

### Output in Google Spreadsheet
#### message sheet
|  ts  |  post_at |   channel  |  post_by  |   text  |  thread_ts  |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  946652400  |  2000-01-01  |  general  |  Takuya  |  This is a test.  |    |

Every message in public channels in your Slack workspace is logged in the message sheet

#### mention sheet

|  ts  |  post_at |   channel  |  post_by  |   text  |  thread_ts  | toWhom |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
|  946652400  |  2000-01-01  |  general  |  Takuya  |  <@SAMPLE> Hi, This is a test.  |    | Tokiwa |

By contrast to the message sheet, only messages which mention someone are logged in the mention sheet. If a message mentions more than one person, the record is logged separate rows, which means when you mention two people, the number of rows is two.

### How to Utilize
The easiest way of analyzing is using pivot table in Google Spreadsheet. However I recommend that you use [Google Data Studio](https://support.google.com/datastudio/answer/6283323?hl=en). You can visualize your data and easily know what is going on in your Slack workspace.

## Prerequisites
- Node.js
- google/clasp

## Getting Started
### Clone this repository
```
git clone https://github.com/takuya0206/slackMessageLogger.git
```

### Install dependencies
```
npm install
```

### Configuration
#### Make a copy of `.clasp.sample.json` , rename it `.clasp.json`, and change scriptId.
What is scriptId? https://github.com/google/clasp#scriptid-required
```
{
  "scriptId": <your_script_id>,
  "rootDir": "dist"
}
```
#### Make a copy of `src/app/constants.sample.ts` , rename it `constants.ts`, and change id.
Where you can find Google spreadsheet id? https://developers.google.com/sheets/api/guides/concepts

```
{
  id: '<your_outputSpreadsheet_id>',
  messageSheet: 'message',
  mentionSheet: 'mention',
}
```
#### Store your Slack token in ScriptProperties.
The key must be the same as the following.
```
export class Properties {
  private SLACK_TOKEN: string;

  constructor() {
    this.SLACK_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_TOKEN');
  }
  getSlackToken(): string {
    return this.SLACK_TOKEN;
  }
}
```
How to get a Slack token? https://api.slack.com/authentication/basics

#### Open src/appsscript.json, change timeZone (optional)
```
{
  "timeZone": "Asia/Tokyo", ## Change timeZone
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "dayjs",
        "libraryId": "1ShsRhHc8tgPy5wGOzUvgEhOedJUQD53m-gd8lG2MOgs-dXC_aCZn9lFB",
        "version": "1"
      }]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```
### Deploy
Deploy the code you have configured to your Google Apps Script project. When you deploy for the first time, you are required to `login clasp` and configure Google Apps Script API in https://script.google.com/home/usersettings.

```
npm run build
clasp push
```

### Run
#### Set a time-based trigger
Set a time-based trigger for the function named as `logSlackMessages`, which should be run everyday. This program is designed to log messages within 24 hours before.

#### Manual way (optional)
If you want previous logs, change the following code in `src/app/slack.service.ts` and specify how long before you want. Then, manually run `logSlackMessages`.
```
const yesterday = dayjs.dayjs().subtract(1, 'day').unix();
```

## License
This software is developed with [gas-clasp-starter](https://github.com/howdy39/gas-clasp-starter) ([Copyright (c) 2018 Tatsuya Nakano](https://github.com/howdy39/gas-clasp-starter/blob/master/LICENSE.txt)) and  released under MIT license.
