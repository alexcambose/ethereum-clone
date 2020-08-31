import Trie from './Trie';
import Account from '../account/Account';
export default class State {
  stateTrie: Trie;
  storageTrieMap: { [address: string]: Trie };

  constructor() {
    this.stateTrie = new Trie();
    this.storageTrieMap = {};
  }

  putAccount({
    address,
    accountData,
  }: {
    address: string;
    accountData: object;
  }) {
    if (!this.storageTrieMap[address]) {
      this.storageTrieMap[address] = new Trie();
    }

    this.stateTrie.put({
      key: address,
      value: {
        ...accountData,
        storageRoot: this.storageTrieMap[address].rootHash,
      },
    });
  }

  getAccount({ address }: { address: string }): Account {
    return this.stateTrie.get({ key: address });
  }

  getStateRoot(): string {
    return this.stateTrie.rootHash;
  }
}
