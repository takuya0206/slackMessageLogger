import { slackUserProp } from '../types/types';

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

export const convertUserIdToName = async (
  users: slackUserProp[],
  userId: string
): Promise<string | null> => {
  let name = null;
  users.forEach(async (user) => {
    if (user.id === userId) {
      name = user.profile.real_name;
    }
  });
  return name;
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
