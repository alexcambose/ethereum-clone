import Trie from './Trie';

export default class State {
  stateTrie: Trie;
  constructor() {
    this.stateTrie = new Trie();
  }

  putAccount({
    address,
    accountData,
  }: {
    address: string;
    accountData: object;
  }) {
    this.stateTrie.put({ key: address, value: accountData });
  }

  getAccount({ address }: { address: string }) {
    return this.stateTrie.get({ key: address });
  }

  getStateRoot(): string {
    return this.stateTrie.rootHash;
  }
}
