import { getTalkToWhom, convertUserIdToDisplayName } from '../app/util';
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

  describe('convertSlackIdToDisplayName()', () => {
    const parameter = [
      {
        id: 'test',
        name: 'test',
        deleted: false,
        profile: {
          real_name: 'test',
          display_name: 'test',
        },
      },
    ];
    it('no match', () => {
      expect(convertUserIdToDisplayName(parameter, 'no match')).toStrictEqual(null);
    });
    it('match', () => {
      expect(convertUserIdToDisplayName(parameter, 'test')).toStrictEqual('test');
    });
  });
});
