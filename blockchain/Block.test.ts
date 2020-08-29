import Block from "./Block";
import { keccakHash } from "../util";

describe("Block", () => {
  describe("calculateBlockTargetHash()", () => {
    it("calculates the maximum hash when the last block difficulty is 1", () => {
      expect(
        Block.calculateBlockTargetHash({
          // @ts-ignore
          lastBlock: { blockHeaders: { difficulty: 1 } },
        })
      ).toEqual("f".repeat(64));
    });
    it("calculates ta low hash value when the last block difficulty is high", () => {
      expect(
        Block.calculateBlockTargetHash({
          // @ts-ignore
          lastBlock: { blockHeaders: { difficulty: 500 } },
        }) < "1"
      ).toBeTruthy();
    });
  });

  describe("mineBlock()", () => {
    let lastBlock: Block;
    let minedBlock: Block;

    beforeEach(() => {
      lastBlock = Block.genesis();
      minedBlock = Block.mineBlock({ lastBlock, beneficiary: "aasd" });
    });
    it("mines a block", () => {
      expect(minedBlock).toBeInstanceOf(Block);
    });

    it("mines a block that meets the proof of work requirements", () => {
      const target = Block.calculateBlockTargetHash({ lastBlock });
      const {
        blockHeaders: { nonce, ...truncatedBlockHeaders },
      } = minedBlock;
      const hash = keccakHash(keccakHash(truncatedBlockHeaders) + nonce);
      expect(hash < target).toBeTruthy();
    });
  });

  describe("adjustDifficulty()", () => {
    it("keeps the difficulty above 0", () => {
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
    it("increases the difficulty for a quickly mined block", () => {
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
    it("decreases the difficulty for a slowly mined block", () => {
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
});
