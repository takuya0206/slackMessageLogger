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
