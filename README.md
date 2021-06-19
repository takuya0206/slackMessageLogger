# Slack Message Logger
This is a tool for logging slack messages with Google Spreadsheet in order to allow you to analyze communication in the workplace.

## What You Can Do
By using this, you can analyze communication in your Slack workspace such as how active each channel is, who is mentioned the most, whom a member mentions, etc. For example, you can utilize it for knowing how onboarding is going well.

### Output in Google Spreadsheet
#### message sheet
![message_sheet.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/147086/e86dd10b-dd5d-d423-5ef6-2ab637e0b866.png)

Every message in public channels in your Slack workspace is logged in the message sheet

#### mention sheet
![mention_sheet.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/147086/2a464e32-d082-b62e-028f-49dc50257b6a.png)

By contrast to the message sheet, only messages which mention someone are logged in the mention sheet. If a message mentions more than one person, the record is logged separate rows, which means when you mention two people, the number of rows is two.

### How to Utilize
The easiest way of analyzing is using pivot table in Google Spreadsheet. However I recommend that you use [Google Data Studio](https://support.google.com/datastudio/answer/6283323?hl=en). You can visualize your data and easily know what is going on in your Slack workspace.
The following picture is an example for Google Data Studio, which visualizes the number of posts in each channel. 

![example_dataportal.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/147086/be66373e-87e3-260e-22be-692e32a7df5a.png)

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
Firstly, you get Slack token. How to get a Slack token? https://api.slack.com/authentication/basics  
Next, you store the Slack token in your Google Apps Script project by using ScriptProperties. The key must be the same as the one in this repository, i.e. `SLACK_TOKEN`. How to store data? https://developers.google.com/apps-script/guides/properties#saving_data

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
Set a time-based trigger for the function named as `logSlackMessages`, which should be run everyday. **This software is designed to log messages within 24 hours before**.

#### Manual way (optional)
If you want previous logs, change the following code in `src/app/slack.service.ts` and specify how long before you want. Then, manually run `logSlackMessages`.
```
const yesterday = dayjs.dayjs().subtract(1, 'day').unix();
```

## License
This software is developed with [gas-clasp-starter](https://github.com/howdy39/gas-clasp-starter) ([Copyright (c) 2018 Tatsuya Nakano](https://github.com/howdy39/gas-clasp-starter/blob/master/LICENSE.txt)) and  released under MIT license.
