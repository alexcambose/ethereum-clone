import { ec, keccakHash } from '../util';
import { STARTING_BALANCE } from '../config';
import { ec as EC } from 'elliptic';
export default class Account {
  keyPair;
  address: string;
  balance: number;
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.address = this.keyPair.getPublic();
    this.balance = STARTING_BALANCE;
  }

  sign(data): EC.Signature {
    return this.keyPair.sign(keccakHash(data));
  }
  static verifySignature({ publicKey, data, signature }): Boolean {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
    return keyFromPublic.verify(keccakHash(data), signature);
  }
}
