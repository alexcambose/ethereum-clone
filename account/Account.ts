import { ec, keccakHash } from '../util';
import { STARTING_BALANCE } from '../config';
import { ec as EC } from 'elliptic';
import State from '../store/State';
export default class Account {
  keyPair;
  address: string;
  balance: number;
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.address = this.keyPair.getPublic().encode('hex');
    this.balance = STARTING_BALANCE;
  }

  sign(data): EC.Signature {
    return this.keyPair.sign(keccakHash(data));
  }

  toJSON() {
    return {
      address: this.address,
      balance: this.balance,
    };
  }
  static verifySignature({ publicKey, data, signature }): Boolean {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
    return keyFromPublic.verify(keccakHash(data), signature);
  }

  static calculateBalance({
    address,
    state,
  }: {
    address: string;
    state: State;
  }): number {
    return state.getAccount({ address }).balance;
  }
}
