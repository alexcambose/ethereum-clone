import Block from './Block';

export default class Blockchain {
  chain: Block[] = [Block.genesis()];

  constructor() {}

  async addBlock({ block }) {
    await Block.validateBlock({ lastBlock: this.lastBlock(), block });
    this.chain.push(block);
  }

  lastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
}
// TODO delete
// const blockchain = new Blockchain();
//
// for (let i = 0; i < 1000; i++) {
//   const lastBlock = blockchain.lastBlock();
//   const block = Block.mineBlock({ lastBlock, beneficiary: "asd" });
//   blockchain.addBlock({ block });
//   console.log("block", block);
// }
