import Block from './Block';
import Transaction from '../transaction/Transaction';
import TransactionQueue from '../transaction/TransactionQueue';

export default class Blockchain {
  chain: Block[] = [Block.genesis()];

  constructor() {}

  async addBlock({
    block,
    transactionQueue,
  }: {
    block: Block;
    transactionQueue: TransactionQueue;
  }) {
    await Block.validateBlock({ lastBlock: this.lastBlock(), block });
    this.chain.push(block);
    transactionQueue.clearBlockTransactions({
      transactionSeries: block.transactionSeries,
    });
  }

  lastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  async replaceChain({ chain }: { chain: Block[] }): Promise<void> {
    for (let i = 0; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = i !== 0 && chain[i - 1];

      await Block.validateBlock({ lastBlock, block });
      console.log(
        `*-- Validated block number: ${block.blockHeaders.number} --*`
      );
    }
    this.chain = chain;
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
