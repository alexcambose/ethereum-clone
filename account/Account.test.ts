import Account from './Account';
import { ec as EC } from 'elliptic';

describe('Account', () => {
  let account: Account;
  let data;
  let signature: EC.Signature;
  beforeEach(() => {
    account = new Account();
    data = { foo: 'foo' };
    signature = account.sign(data);
  });

  describe('verifySignature', () => {
    it('validates a signature generated by the account', () => {
      expect(
        Account.verifySignature({ publicKey: account.address, signature, data })
      ).toBeTruthy();
    });

    it('invalidates a signature not generated by the account', () => {
      expect(
        Account.verifySignature({
          publicKey: new Account().address,
          signature,
          data,
        })
      ).toBeFalsy();
    });
  });
});