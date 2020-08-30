import Block from './Block';
import Transaction from '../transaction/Transaction';
import TransactionQueue from '../transaction/TransactionQueue';
import State from '../store/State';

export default class Blockchain {
  chain: Block[] = [Block.genesis()];
  state: State;
  constructor({ state }) {
    this.state = state;
  }

  async addBlock({
    block,
    transactionQueue,
  }: {
    block: Block;
    transactionQueue: TransactionQueue;
  }) {
    await Block.validateBlock({
      lastBlock: this.lastBlock(),
      block,
      state: this.state,
    });
    this.chain.push(block);
    Block.runBlock({ block, state: this.state });
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

      await Block.validateBlock({ lastBlock, block, state: this.state });
      Block.runBlock({ block, state: this.state });
      console.log(
        `*-- Validated block number: ${block.blockHeaders.number} --*`
      );
    }
    this.chain = chain;
  }
}
