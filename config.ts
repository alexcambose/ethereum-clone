import Block from './blockchain/Block';

export const GENESIS_DATA: Block = {
  blockHeaders: {
    parentHash: '--genesis-parent-hash--',
    beneficiary: '--genesis-beneficiary--',
    difficulty: 1,
    number: 0,
    timestamp: 0,
    nonce: 0,
    transactionsRoot: '--genesis-transactions-root--',
  },
  transactionSeries: [],
};

export const MINE_RATE = 13 * 1000;
export const STARTING_BALANCE = 1000;
