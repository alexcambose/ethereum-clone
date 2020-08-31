import Transaction from './Transaction';
import Account from '../account/Account';
import State from '../store/State';
import { OpcodesEnum } from '../interpreter/Interpreter';

describe('Transaction', () => {
  let standardTransaction: Transaction;
  let miningRewardTransaction: Transaction;
  let account: Account;
  let createAccountTransaction: Transaction;
  let state: State;
  let toAccount: Account;

  beforeEach(() => {
    account = new Account();
    toAccount = new Account();
    state = new State();
    state.putAccount({ address: account.address, accountData: account });
    state.putAccount({ address: toAccount.address, accountData: toAccount });
    standardTransaction = Transaction.createTransaction({
      account,
      to: toAccount.address,
      value: 50,
    });
    createAccountTransaction = Transaction.createTransaction({
      account,
    });
    miningRewardTransaction = Transaction.createTransaction({
      beneficiary: account.address,
    });
  });

  describe('validateStandardTransaction()', () => {
    it('validates a valid transaction', () => {
      expect(
        Transaction.validateStandardTransaction({
          transaction: standardTransaction,
          state,
        })
      ).resolves;
    });

    it('does not validate a malformed transaction', () => {
      standardTransaction.to = 'different-recipient';
      expect(
        Transaction.validateStandardTransaction({
          transaction: standardTransaction,
          state,
        })
      ).rejects.toMatchObject({ message: /invalid/ });
    });

    it('does not validate whn the value exceeds the balance', () => {
      standardTransaction = Transaction.createTransaction({
        account,
        to: toAccount.address,
        value: 9999,
      });
      expect(
        Transaction.validateStandardTransaction({
          transaction: standardTransaction,
          state,
        })
      ).rejects.toMatchObject({ message: /exceeds/ });
    });

    it('does not validate when the `to` address does not exist', () => {
      standardTransaction = Transaction.createTransaction({
        account,
        to: 'foo-recipient',
        value: 30,
      });
      expect(
        Transaction.validateStandardTransaction({
          transaction: standardTransaction,
          state,
        })
      ).rejects.toMatchObject({ message: /does not exist/ });
    });

    it('does not validate when the gas limit exceeds the balance', () => {
      standardTransaction = Transaction.createTransaction({
        account,
        to: 'foo-recipient',
        gasLimit: 30000,
      });
      expect(
        Transaction.validateStandardTransaction({
          transaction: standardTransaction,
          state,
        })
      ).rejects.toMatchObject({ message: /exceeds/ });
    });

    it('does not validate when the gas used for the code exceeds the gasLimit', () => {
      const codeHash = 'foo-codehash';
      const code = [
        OpcodesEnum.PUSH,
        1,
        OpcodesEnum.PUSH,
        2,
        OpcodesEnum.ADD,
        OpcodesEnum.STOP,
      ];

      state.putAccount({
        address: codeHash,
        accountData: {
          code,
          codeHash,
        },
      });
      standardTransaction = Transaction.createTransaction({
        account,
        to: codeHash,
        gasLimit: 0,
      });
      expect(
        Transaction.validateStandardTransaction({
          transaction: standardTransaction,
          state,
        })
      ).rejects.toMatchObject({ message: /gas/ });
    });
  });

  describe('validateCreateAccountTransaction()', () => {
    it('validates a create account transaction', () => {
      expect(
        Transaction.validateCreateAccountTransaction({
          transaction: createAccountTransaction,
        })
      ).resolves;
    });

    it('does not validate a non create account transaction', () => {
      expect(
        Transaction.validateCreateAccountTransaction({
          transaction: standardTransaction,
        })
      ).rejects.toMatchObject({ message: /invalid/ });
    });
  });

  describe('validateMiningRewardTransaction()', () => {
    it('validates a mining reward transaction', () => {
      expect(
        Transaction.validateMiningRewardTransaction({
          transaction: miningRewardTransaction,
        })
      ).resolves;
    });
    it('does not validate a tampered with mining reward transaction', () => {
      miningRewardTransaction.value = 9999;
      expect(
        Transaction.validateMiningRewardTransaction({
          transaction: miningRewardTransaction,
        })
      ).rejects.toMatchObject({ message: /not equal/ });
    });
  });
});
