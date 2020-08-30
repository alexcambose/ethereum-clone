import { GENESIS_DATA, MINE_RATE } from '../config';
import { keccakHash } from '../util';
import Transaction from '../transaction/Transaction';
import State from '../store/State';
import Trie from '../store/Trie';

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt('f'.repeat(HASH_LENGTH), 16);
const MAX_NONCE_VALUE = 2 ** 64;

interface TruncatedBlockHeaders {
  parentHash: string;
  beneficiary: string;
  difficulty: number;
  number: number;
  timestamp: number;
  transactionsRoot: string;
  stateRoot: string;
}

export interface BlockHeaders extends TruncatedBlockHeaders {
  nonce: number;
}

export default class Block {
  blockHeaders: BlockHeaders;
  transactionSeries: Transaction[];

  constructor({ blockHeaders, transactionSeries }) {
    this.blockHeaders = blockHeaders;
    this.transactionSeries = transactionSeries;
  }

  static calculateBlockTargetHash({ lastBlock }: { lastBlock: Block }) {
    const value = (MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty).toString(
      16
    );

    if (value.length > HASH_LENGTH) {
      return 'f'.repeat(HASH_LENGTH);
    }

    return '0'.repeat(HASH_LENGTH - value.length) + value;
  }

  static adjustDifficulty({
    lastBlock,
    timestamp,
  }: {
    lastBlock: Block;
    timestamp: number;
  }) {
    const difference = timestamp - lastBlock.blockHeaders.timestamp;
    const { difficulty } = lastBlock.blockHeaders;
    if (difference > MINE_RATE) return Math.max(difficulty - 1, 1);
    return difficulty + 1;
  }

  static mineBlock({
    lastBlock,
    beneficiary,
    transactionSeries,
    stateRoot,
  }: {
    lastBlock: Block;
    beneficiary: string;
    transactionSeries: Transaction[];
    stateRoot: string;
  }) {
    const target = Block.calculateBlockTargetHash({ lastBlock });
    const miningRewardTransaction = Transaction.createTransaction({
      beneficiary,
    });
    transactionSeries.push(miningRewardTransaction);
    const transactionsTrie = Trie.buildTrie({ items: transactionSeries });

    let timestamp: number;
    let truncatedBlockHeaders: TruncatedBlockHeaders;
    let header;
    let nonce;
    let underTargetHash;
    do {
      timestamp = Date.now();
      truncatedBlockHeaders = {
        parentHash: keccakHash(lastBlock.blockHeaders),
        beneficiary,
        difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
        number: lastBlock.blockHeaders.number + 1,
        timestamp,
        transactionsRoot: transactionsTrie.rootHash,
        stateRoot,
      };
      header = keccakHash(truncatedBlockHeaders);
      nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);
      underTargetHash = keccakHash(header + nonce);
    } while (underTargetHash > target);

    return new this({
      blockHeaders: { ...truncatedBlockHeaders, nonce },
      transactionSeries,
    });
  }

  static genesis(): Block {
    return new this(GENESIS_DATA);
  }

  static async validateBlock({
    lastBlock,
    block,
    state,
  }: {
    lastBlock?: Block;
    block: Block;
    state: State;
  }): Promise<boolean> {
    if (keccakHash(block) === keccakHash(Block.genesis())) {
      return true;
    }
    if (keccakHash(lastBlock.blockHeaders) !== block.blockHeaders.parentHash) {
      throw new Error(
        "The parent hash must be a hash of the last block's headers"
      );
    }
    if (block.blockHeaders.number !== lastBlock.blockHeaders.number + 1) {
      throw new Error('The block must increment the number by 1');
    }
    if (
      Math.abs(
        block.blockHeaders.difficulty - lastBlock.blockHeaders.difficulty
      ) > 1
    ) {
      throw new Error('');
    }
    const rebuiltTransactionsTrie = Trie.buildTrie({
      items: block.transactionSeries,
    });
    if (
      rebuiltTransactionsTrie.rootHash !== block.blockHeaders.transactionsRoot
    ) {
      throw new Error(
        `Rebuilt transactions root does not match the block's transactions root: ${block.blockHeaders.transactionsRoot}`
      );
    }
    const underTargetHash = Block.calculateBlockTargetHash({ lastBlock });
    const {
      blockHeaders: { nonce, ...truncatedBlockHeaders },
    } = block;

    const hash = keccakHash(keccakHash(truncatedBlockHeaders) + nonce);

    if (underTargetHash < hash) {
      throw new Error('The block does not meet the proof of work requirement');
    }

    await Transaction.validateTransactionSeries({
      transactionSeries: block.transactionSeries,
      state,
    });
    return true;
  }

  static runBlock({ block, state }) {
    // console.log(`Running transaction series`, block.transactionSeries);
    for (let transaction of block.transactionSeries) {
      Transaction.runTransaction({ transaction, state });
    }
  }
}
