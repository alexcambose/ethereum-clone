import { v4 as uuid } from 'uuid';
import Account from '../account/Account';
import { ec as EC } from 'elliptic';
import State from '../store/State';
import { MINING_REWARD } from '../config';
import Interpreter from '../interpreter/Interpreter';

enum TransactionTypeEnum {
  CREATE_ACCOUNT,
  TRANSACT,
  MINING_REWARD,
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
  gasLimit = 0;
  constructor({
    id = uuid(),
    from = '-',
    to = '-',
    value = 0,
    data = null,
    signature = null,
    gasLimit = 0,
  }) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.value = value;
    this.data = data;
    this.signature = signature;
    this.gasLimit = gasLimit;
  }

  static createTransaction({
    account,
    to,
    value,
    beneficiary,
    gasLimit,
  }: {
    account?: Account;
    to?: string;
    value?: number;
    beneficiary?: string;
    gasLimit?: number;
  }) {
    if (beneficiary) {
      return new Transaction({
        to: beneficiary,
        value: MINING_REWARD,
        gasLimit,
        data: {
          type: TransactionTypeEnum.MINING_REWARD,
        },
      });
    }
    if (to) {
      const transactionData = {
        id: uuid(),
        from: account.address,
        to,
        value: value || 0,
        gasLimit: gasLimit || 0,
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
    const { id, from, signature, value, to, gasLimit } = transaction;
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
    if (value + gasLimit > fromBalance) {
      throw new Error(
        `Transaction value ${value} and gas limit ${gasLimit} exceeds the balance ${fromBalance}`
      );
    }

    const toAccount = state.getAccount({ address: to });
    if (!toAccount) {
      throw new Error(`The to field: ${to} does not exist!`);
    }

    if (toAccount.codeHash) {
      const { gasUsed } = new Interpreter({
        storageTrie: state.storageTrieMap[toAccount.codeHash],
      }).runCode(toAccount.code);
      if (gasUsed > gasLimit) {
        throw new Error(
          `Transaction needs more gas. Provided: ${gasLimit}. Needs: ${gasUsed}`
        );
      }
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
        `The transaction account data has an incorrect number of fields. Current: ${fields} expected: ${expectedAccountDataFields}`
      );
    }
    fields.forEach((field) => {
      if (!expectedAccountDataFields.includes(field)) {
        throw new Error(`The field ${field}, is unexpected for account data`);
      }
    });
    return true;
  }

  static async validateMiningRewardTransaction({
    transaction,
  }: {
    transaction: Transaction;
  }): Promise<boolean> {
    const { value } = transaction;
    if (value !== MINING_REWARD) {
      throw new Error(
        `The provided mining reward value: ${value} does not equal: ${MINING_REWARD}`
      );
    }
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
        case TransactionTypeEnum.MINING_REWARD:
          await this.validateMiningRewardTransaction({ transaction });
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
      case TransactionTypeEnum.MINING_REWARD:
        Transaction.runMiningRewardTransaction({ state, transaction });
        console.log(
          '-- Updated the account data to reflect the mining reward--'
        );
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
    const { value, gasLimit } = transaction;
    let gasUsed = 0;
    let result;

    if (toAccount.codeHash) {
      const interpreter = new Interpreter({
        storageTrie: state.storageTrieMap[toAccount.codeHash],
      });
      ({ result, gasUsed } = interpreter.runCode(toAccount.code));
      console.log(` *** ${result} ***`);
    }
    const refund = gasLimit - gasUsed;
    fromAccount.balance -= value;
    fromAccount.balance -= gasLimit;
    fromAccount.balance += refund;
    toAccount.balance += value;
    toAccount.balance += gasUsed;

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
    const { address, codeHash } = accountData;

    state.putAccount({ address: codeHash ? codeHash : address, accountData });
  }

  static runMiningRewardTransaction({
    state,
    transaction,
  }: {
    transaction: Transaction;
    state: State;
  }) {
    const { to, value } = transaction;
    const accountData = state.getAccount({ address: to });

    accountData.balance += value;

    state.putAccount({ address: to, accountData });
  }
}
