import {
  getTalkToWhom,
  convertUserIdToUserInfo,
  convertAryObjToMultiAry,
  findNewRepliesWithPersistentProperty,
} from '../app/util';
jest.unmock('../app/util');

describe('util', () => {
  describe('getTalkToWhom()', () => {
    it('No mention', () => {
      const parameter = 'TextTextTextText';
      expect(getTalkToWhom(parameter)).toStrictEqual([]);
    });
    it('two mentions', () => {
      const parameter = '<@1234><@5678>TextTextTextText';
      expect(getTalkToWhom(parameter)).toStrictEqual(['1234', '5678']);
    });
  });

  describe('convertSlackIdToName()', () => {
    const parameter = [
      {
        id: 'test',
        name: 'test',
        deleted: false,
        profile: {
          real_name: 'test',
          display_name: 'test',
          email: 'test',
        },
      },
    ];
    it('no match', async () => {
      return convertUserIdToUserInfo(parameter, 'no match').then((data) =>
        expect(data).toStrictEqual(null)
      );
    });
    it('match', async () => {
      return convertUserIdToUserInfo(parameter, 'test').then((data) =>
        expect(data).toStrictEqual({ name: 'test', email: 'test' })
      );
    });
  });

  describe('convertAryObjToMultiAry()', () => {
    it('with the correct parameter', () => {
      const parameter = [
        { key1: 'value1', key2: 'value2' },
        { key1: 'value3', key2: 'value4' },
      ];
      const expected = [
        ['key1', 'key2'],
        ['value1', 'value2'],
        ['value3', 'value4'],
      ];
      expect(convertAryObjToMultiAry(parameter)).toStrictEqual(expected);
    });
  });

  describe('findNewRepliesWithPersistentProperty()', () => {
    it('correct parameter', () => {
      const messages = [
        { ts: 'test1', reply_count: 1 },
        { ts: 'test2', reply_count: 3 },
        { ts: 'test3' },
        { ts: 'test4' },
      ];
      const persistentProperty = {
        test1: {
          ts: 'test1',
          reply_count: 1,
        },
        test2: {
          ts: 'test2',
          reply_count: 2,
        },
        test3: {
          ts: 'test3',
        },
      };
      // @ts-ignore
      return findNewRepliesWithPersistentProperty(messages, persistentProperty).then((data) => {
        expect(data).toStrictEqual([{ ts: 'test2', reply_count: 3 }, { ts: 'test4' }]);
      });
    });
  });
});
