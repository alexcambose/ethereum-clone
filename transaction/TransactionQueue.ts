import Transaction from './Transaction';

export default class TransactionQueue {
  transactionMap;
  constructor() {
    this.transactionMap = {};
  }
  add(transaction: Transaction): void {
    this.transactionMap[transaction.id] = transaction;
  }

  getTransactionSeries(): Transaction[] {
    return Object.values(this.transactionMap);
  }

  clearBlockTransactions({
    transactionSeries,
  }: {
    transactionSeries: Transaction[];
  }) {
    for (const transaction of transactionSeries) {
      delete this.transactionMap[transaction.id];
    }
  }
}
