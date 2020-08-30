import { GENESIS_DATA, MINE_RATE } from '../config';
import { keccakHash } from '../util';

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt('f'.repeat(HASH_LENGTH), 16);
const MAX_NONCE_VALUE = 2 ** 64;

interface TruncatedBlockHeaders {
  parentHash: string;
  beneficiary: string;
  difficulty: number;
  number: number;
  timestamp: number;
}

export interface BlockHeaders extends TruncatedBlockHeaders {
  nonce: number;
}

export default class Block {
  blockHeaders: BlockHeaders;

  constructor({ blockHeaders }) {
    this.blockHeaders = blockHeaders;
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
  }: {
    lastBlock: Block;
    beneficiary: string;
  }) {
    const target = Block.calculateBlockTargetHash({ lastBlock });
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
      };
      header = keccakHash(truncatedBlockHeaders);
      nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);
      underTargetHash = keccakHash(header + nonce);
    } while (underTargetHash > target);

    return new this({ blockHeaders: { ...truncatedBlockHeaders, nonce } });
  }

  static genesis(): Block {
    return new this(GENESIS_DATA);
  }

  static async validateBlock({
    lastBlock,
    block,
  }: {
    lastBlock?: Block;
    block: Block;
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
    const underTargetHash = Block.calculateBlockTargetHash({ lastBlock });
    const {
      blockHeaders: { nonce, ...truncatedBlockHeaders },
    } = block;

    const hash = keccakHash(keccakHash(truncatedBlockHeaders) + nonce);

    if (underTargetHash < hash) {
      throw new Error('The block does not meet the proof of work requirement');
    }
    return true;
  }
}
