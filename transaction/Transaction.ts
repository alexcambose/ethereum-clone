import uuid from 'uuid/v4';
import Account from '../account/Account';
import { ec as EC } from 'elliptic';
enum TransactionTypeEnum {
  CREATE_ACCOUNT,
  TRANSACT,
}

export default class Transaction {
  id: string;
  from: string;
  to: string;
  value: number;
  data: object;
  signature: EC.Signature;
  constructor({
    id = uuid(),
    from = '-',
    to = '-',
    value = 0,
    data = null,
    signature = null,
  }) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.value = value;
    this.data = data;
    this.signature = signature;
  }

  static createTransaction({
    account,
    to,
    value,
  }: {
    account: Account;
    to: string;
    value: number;
  }) {
    if (to) {
      const transactionData = {
        id: uuid(),
        from: account.address,
        to,
        value,
        data: { type: TransactionTypeEnum.TRANSACT },
      };
      return new Transaction({
        ...transactionData,
        signature: account.sign(transactionData),
      });
    }
    return new Transaction({
      data: {
        type: TransactionTypeEnum.CREATE_ACCOUNT,
        accountData: account.toJSON(),
      },
    });
  }
}
