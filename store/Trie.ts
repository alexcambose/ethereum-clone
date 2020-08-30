import { keccakHash } from '../util';
import _ from 'lodash';

class Node {
  value: any;
  childMap: object;
  constructor() {
    this.value = null;
    this.childMap = {};
  }
}

export default class Trie {
  head: Node;
  rootHash: string;
  constructor() {
    this.head = new Node();
    this.generateRootHash();
  }
  generateRootHash() {
    this.rootHash = keccakHash(this.head);
  }
  get({ key }) {
    let node = this.head;
    for (const character of key) {
      if (node.childMap[character]) {
        node = node.childMap[character];
      }
    }
    return _.cloneDeep(node.value);
  }

  put({ key, value }) {
    let node = this.head;

    for (const character of key) {
      if (!node.childMap[character]) {
        node.childMap[character] = new Node();
      }

      node = node.childMap[character];
    }
    node.value = value;
    this.generateRootHash();
  }
  static buildTrie({ items }: { items: object[] }): Trie {
    const trie = new this();

    for (const item of items.sort((a, b) =>
      keccakHash(a) > keccakHash(b) ? 1 : 0
    )) {
      trie.put({ key: keccakHash(item), value: item });
    }

    return trie;
  }
}
