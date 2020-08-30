import Trie from './Trie';

describe('Trie', () => {
  let trie: Trie;
  beforeEach(() => {
    trie = new Trie();
  });
  it('has a root hash', () => {
    expect(trie.rootHash).not.toBe(undefined);
  });

  describe('generateRootHash()', () => {
    it('', () => {});
  });

  describe('get()', () => {
    it('returns a copy of the restored value', () => {
      const key = 'foo';
      const value = { one: 1 };
      trie.put({ key, value });

      const gottenValue = trie.get({ key });
      value.one = 2;
      expect(gottenValue).toEqual({ one: 1 });
    });
  });

  describe('put()', () => {
    it('stores a value under a key', () => {
      const key = 'foo';
      const value = 'bar';

      trie.put({ key, value });
      expect(trie.get({ key })).toEqual(value);
    });

    it('generates a new rot hash after entering a new value', () => {
      const originalRootHash = trie.rootHash;
      trie.put({ key: 'foo', value: 'bar' });
      expect(trie.rootHash).not.toEqual(originalRootHash);
    });
  });
});
