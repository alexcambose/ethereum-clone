import { v4 as uuid } from 'uuid';
import Account from '../account/Account';
import { ec as EC } from 'elliptic';
import State from '../store/State';
enum TransactionTypeEnum {
  CREATE_ACCOUNT,
  TRANSACT,
}
interface TransactionData {
  type: TransactionTypeEnum;
  accountData?: object;
}
export default class Transaction {
  id: string;
  from: string;
  to: string;
  value: number;
  data: TransactionData;
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
    to?: string;
    value?: number;
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
  static async validateStandardTransaction({
    transaction,
    state,
  }: {
    transaction: Transaction;
    state: State;
  }): Promise<boolean> {
    const { id, from, signature, value, to } = transaction;
    const transactionData = { ...transaction };
    delete transactionData.signature;

    if (
      !Account.verifySignature({
        publicKey: from,
        data: transactionData,
        signature,
      })
    ) {
      throw new Error(`Transaction ${id} signature is invalid`);
    }
    const fromBalance = state.getAccount({ address: from }).balance;
    if (value > fromBalance) {
      throw new Error(
        `Transaction value ${value} exceeds the balance ${fromBalance}`
      );
    }

    const toAccount = state.getAccount({ address: to });
    if (!toAccount) {
      throw new Error(`The to field: ${to} does not exist!`);
    }
    return true;
  }
  static async validateCreateAccountTransaction({
    transaction,
  }: {
    transaction: Transaction;
  }): Promise<boolean> {
    const expectedAccountDataFields = Object.keys(new Account().toJSON());
    const fields = Object.keys(transaction.data.accountData);

    if (fields.length !== expectedAccountDataFields.length) {
      throw new Error(
        `The transaction account data has an incorrect number of fields`
      );
    }
    fields.forEach((field) => {
      if (!expectedAccountDataFields.includes(field)) {
        throw new Error(`The field ${field}, is unexpected for account data`);
      }
    });
    return true;
  }

  static async validateTransactionSeries({
    transactionSeries,
    state,
  }: {
    transactionSeries: Transaction[];
    state: State;
  }): Promise<boolean> {
    for (const transaction of transactionSeries) {
      switch (transaction.data.type) {
        case TransactionTypeEnum.CREATE_ACCOUNT:
          await this.validateCreateAccountTransaction({ transaction });
          break;
        case TransactionTypeEnum.TRANSACT:
          await this.validateStandardTransaction({ transaction, state });
          break;
        default:
          break;
      }
    }

    return true;
  }

  static runTransaction({
    transaction,
    state,
  }: {
    transaction: Transaction;
    state: State;
  }) {
    switch (transaction.data.type) {
      case TransactionTypeEnum.TRANSACT:
        Transaction.runStandardTransaction({ state, transaction });
        console.log(
          '-- Updated account data to reflect the standard transaction --'
        );
        break;
      case TransactionTypeEnum.CREATE_ACCOUNT:
        Transaction.runCreateAccountTransaction({ state, transaction });
        console.log('-- Stored the account data --');
        break;
      default:
        break;
    }
  }

  static runStandardTransaction({
    state,
    transaction,
  }: {
    transaction: Transaction;
    state: State;
  }) {
    const fromAccount = state.getAccount({ address: transaction.from });
    const toAccount = state.getAccount({ address: transaction.to });

    const { value } = transaction;

    fromAccount.balance -= value;
    toAccount.balance += value;

    state.putAccount({
      address: fromAccount.address,
      accountData: fromAccount,
    });
    state.putAccount({ address: toAccount.address, accountData: toAccount });
  }
  static runCreateAccountTransaction({
    state,
    transaction,
  }: {
    transaction: Transaction;
    state: State;
  }) {
    const { accountData } = transaction.data;
    // @ts-ignore
    const { address } = accountData;

    state.putAccount({ address, accountData });
  }
}
