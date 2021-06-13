import { getTalkToWhom } from '../app/util';
jest.unmock('../app/util');

describe('util', () => {
  describe('getTalkToWhom()', () => {
    it('No mention', () => {
      const parameter = 'TextTextTextText';
      expect(getTalkToWhom(parameter)).toStrictEqual([]);
    });
  });

  describe('getTalkToWhom()', () => {
    it('two mentions', () => {
      const parameter = '<@1234><@5678>TextTextTextText';
      expect(getTalkToWhom(parameter)).toStrictEqual(['1234', '5678']);
    });
  });
});
