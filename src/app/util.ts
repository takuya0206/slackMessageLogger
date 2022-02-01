import { slackUserProp, slackMessageProp, persistentPropertyType } from '../types/types';

export const getTalkToWhom = (text: string): string[] => {
  const result: string[] = [];
  const talkTos = text.match(/<@\w*>/g);
  if (talkTos) {
    talkTos.forEach((person) => {
      result.push(person.replace(/<@/, '').replace('>', ''));
    });
    return result;
  } else {
    return result;
  }
};

export const convertUserIdToUserInfo = async (
  users: slackUserProp[],
  userId: string
): Promise<{name: string; email: string; } | null> => {
  let result = null
  users.forEach(async (user) => {
    if (user.id === userId) {
      result = {
        name: user.profile.real_name,
        email: user.profile.email
      }
    }
  });
  return result;
};

// convert [{}, {}]  to [[], []]
export const convertAryObjToMultiAry = (AryObj: { [key: string]: any }[]): unknown[][] => {
  const result: unknown[][] = [];
  const keys = Object.keys(AryObj[0]);
  result.push(keys); // keys should be header for spreadsheet
  AryObj.forEach((obj) => {
    const ary = [];
    keys.forEach((key) => {
      ary.push(obj[key]);
    });
    result.push(ary);
  });
  return result;
};

export const findNewRepliesWithPersistentProperty = async (
  messages: slackMessageProp[],
  persistentProperty: persistentPropertyType
): Promise<slackMessageProp[]> => {
  const result = [];
  if (!persistentProperty) {
    return messages;
  } else {
    return await Promise.all(
      messages.map(async (message) => {
        const isExisted: boolean = persistentProperty[message.ts] ? true : false;
        if (isExisted) {
          if (message.reply_count > persistentProperty[message.ts].reply_count) {
            result.push(message);
          }
        } else {
          // if it's not existed, it means a new message
          result.push(message);
        }
      })
    ).then(() => {
      return result;
    });
  }
};
