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

export const convertUserIdToDisplayName = (
  users: slackUserProp[],
  userId: string
): string | null => {
  const displayName = users.filter((user) => {
    if (user.id === userId) {
      return user.profile.display_name;
    }
  });
  return displayName.length > 0 ? displayName[0].profile.display_name : null;
};
