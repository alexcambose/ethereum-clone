import { ec, keccakHash } from '../util';
import { STARTING_BALANCE } from '../config';
import { ec as EC } from 'elliptic';
import State from '../store/State';
import { OpcodesEnum } from '../interpreter/Interpreter';

export default class Account {
  keyPair;
  address: string;
  balance: number;
  code: OpcodesEnum[];
  codeHash: string;
  constructor({ code }: { code?: OpcodesEnum[] } = {}) {
    this.keyPair = ec.genKeyPair();
    this.address = this.keyPair.getPublic().encode('hex');
    this.balance = STARTING_BALANCE;
    this.code = code || [];
    this.generateCodeHash();
  }

  generateCodeHash() {
    this.codeHash = this.code.length
      ? keccakHash(this.address + this.code)
      : null;
  }

  sign(data): EC.Signature {
    return this.keyPair.sign(keccakHash(data));
  }

  toJSON() {
    const obj = {
      address: this.address,
      balance: this.balance,
      code: this.code,
      codeHash: this.codeHash,
    };
    return obj;
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
