import Block from './Block';
import { keccakHash } from '../util';
import State from '../store/State';
import Transaction from '../transaction/Transaction';

describe('Block', () => {
  describe('calculateBlockTargetHash()', () => {
    it('calculates the maximum hash when the last block difficulty is 1', () => {
      expect(
        Block.calculateBlockTargetHash({
          // @ts-ignore
          lastBlock: { blockHeaders: { difficulty: 1 } },
        })
      ).toEqual('f'.repeat(64));
    });
    it('calculates ta low hash value when the last block difficulty is high', () => {
      expect(
        Block.calculateBlockTargetHash({
          // @ts-ignore
          lastBlock: { blockHeaders: { difficulty: 500 } },
        }) < '1'
      ).toBeTruthy();
    });
  });

  describe('mineBlock()', () => {
    let lastBlock: Block;
    let minedBlock: Block;

    beforeEach(() => {
      lastBlock = Block.genesis();
      minedBlock = Block.mineBlock({
        lastBlock,
        beneficiary: 'aasd',
        transactionSeries: [],
        stateRoot: 'a',
      });
    });
    it('mines a block', () => {
      expect(minedBlock).toBeInstanceOf(Block);
    });

    it('mines a block that meets the proof of work requirements', () => {
      const target = Block.calculateBlockTargetHash({ lastBlock });
      const {
        blockHeaders: { nonce, ...truncatedBlockHeaders },
      } = minedBlock;
      const hash = keccakHash(keccakHash(truncatedBlockHeaders) + nonce);
      expect(hash < target).toBeTruthy();
    });
  });

  describe('adjustDifficulty()', () => {
    it('keeps the difficulty above 0', () => {
      expect(
        Block.adjustDifficulty({
          lastBlock: {
            ...Block.genesis(),
            blockHeaders: { ...Block.genesis().blockHeaders, difficulty: 0 },
          },
          timestamp: Date.now(),
        })
      ).toEqual(1);
    });
    it('increases the difficulty for a quickly mined block', () => {
      expect(
        Block.adjustDifficulty({
          lastBlock: {
            ...Block.genesis(),
            blockHeaders: {
              ...Block.genesis().blockHeaders,
              timestamp: 10,
              difficulty: 1,
            },
          },
          timestamp: 20,
        })
      ).toEqual(2);
    });
    it('decreases the difficulty for a slowly mined block', () => {
      expect(
        Block.adjustDifficulty({
          lastBlock: {
            ...Block.genesis(),
            blockHeaders: {
              ...Block.genesis().blockHeaders,
              timestamp: 10,
              difficulty: 2,
            },
          },
          timestamp: 20000,
        })
      ).toEqual(1);
    });
  });

  describe('validateBlock()', () => {
    let block: Block;
    let lastBlock: Block;
    let state: State;

    beforeEach(() => {
      lastBlock = Block.genesis();
      block = Block.mineBlock({
        lastBlock,
        beneficiary: 'b',
        transactionSeries: [],
        stateRoot: 'a',
      });
    });

    it('resolves when the block is the genesis block', () => {
      expect(Block.validateBlock({ block: Block.genesis(), state })).resolves;
    });
    it('resolves if the block is valid', () => {
      expect(Block.validateBlock({ lastBlock, block, state })).resolves;
    });

    it('rejects when the parent hash is invalid', () => {
      block.blockHeaders.parentHash = 'foo';
      expect(Block.validateBlock({ lastBlock, block, state })).rejects;
    });

    it('rejects when the number is not increased by one', () => {
      block.blockHeaders.number = 1234;
      expect(Block.validateBlock({ lastBlock, block, state })).rejects;
    });

    it('rejects when the difficulty adjusts by more than 1', () => {
      block.blockHeaders.difficulty = 31212321;
      expect(Block.validateBlock({ lastBlock, block, state })).rejects;
    });

    it('rejects when the proof of work requirement is not met', () => {
      const originalFunc = Block.calculateBlockTargetHash;
      Block.calculateBlockTargetHash = () => '0'.repeat(64);

      expect(Block.validateBlock({ lastBlock, block, state })).rejects;
      Block.calculateBlockTargetHash = originalFunc;
    });

    it('rejects then the transaction series is not valid', () => {
      block.transactionSeries = [new Transaction({})];
      expect(
        Block.validateBlock({ lastBlock, block, state })
      ).rejects.toMatchObject({ message: /match/ });
    });
  });
});
