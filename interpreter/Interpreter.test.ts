import Interpreter, { OpcodesEnum } from './Interpreter';
import Trie from '../store/Trie';

describe('Interpreter', () => {
  describe('runCode()', () => {
    describe('and the code includes ADD', () => {
      it('adds two values', () => {
        expect(
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            2,
            OpcodesEnum.PUSH,
            3,
            OpcodesEnum.ADD,
            OpcodesEnum.STOP,
          ]).result
        ).toEqual(5);
      });
    });
    describe('and the code includes SUB', () => {
      it('subtracts two values', () => {
        expect(
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            2,
            OpcodesEnum.PUSH,
            3,
            OpcodesEnum.SUB,
            OpcodesEnum.STOP,
          ]).result
        ).toEqual(1);
      });
    });
    describe('and the code includes MUL', () => {
      it('products two values', () => {
        expect(
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            2,
            OpcodesEnum.PUSH,
            3,
            OpcodesEnum.MUL,
            OpcodesEnum.STOP,
          ]).result
        ).toEqual(6);
      });
    });

    describe('and the code includes DIV', () => {
      it('divides one value from another', () => {
        expect(
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            2,
            OpcodesEnum.PUSH,
            3,
            OpcodesEnum.DIV,
            OpcodesEnum.STOP,
          ]).result
        ).toEqual(1.5);
      });
    });

    describe('and the code includes LT', () => {
      it('one value is less than another', () => {
        expect(
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            2,
            OpcodesEnum.PUSH,
            3,
            OpcodesEnum.LT,
            OpcodesEnum.STOP,
          ]).result
        ).toEqual(0);
      });
    });
    describe('and the code includes GT', () => {
      it('one value is greater than another', () => {
        expect(
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            2,
            OpcodesEnum.PUSH,
            3,
            OpcodesEnum.GT,
            OpcodesEnum.STOP,
          ]).result
        ).toEqual(1);
      });
    });
    describe('and the code includes EQ', () => {
      it('one value is equal to another', () => {
        expect(
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            2,
            OpcodesEnum.PUSH,
            2,
            OpcodesEnum.EQ,
            OpcodesEnum.STOP,
          ]).result
        ).toEqual(1);
      });
    });
    describe('and the code includes AND', () => {
      it('ands two conditions', () => {
        expect(
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            0,
            OpcodesEnum.PUSH,
            1,
            OpcodesEnum.AND,
            OpcodesEnum.STOP,
          ]).result
        ).toEqual(0);
      });
    });
    describe('and the code includes OR', () => {
      it('ors two conditions', () => {
        expect(
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            1,
            OpcodesEnum.PUSH,
            0,
            OpcodesEnum.OR,
            OpcodesEnum.STOP,
          ]).result
        ).toEqual(1);
      });
    });
    describe('and the code includes JUMP', () => {
      it('jumps to a destination', () => {
        expect(
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            6,
            OpcodesEnum.JUMP,
            OpcodesEnum.PUSH,
            0,
            OpcodesEnum.JUMP,
            OpcodesEnum.PUSH,
            99,
            OpcodesEnum.STOP,
          ]).result
        ).toEqual(99);
      });
    });
    describe('and the code includes JUMPI', () => {
      it('jumps to a destination', () => {
        expect(
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            8,
            OpcodesEnum.PUSH,
            1,
            OpcodesEnum.JUMPI,
            OpcodesEnum.PUSH,
            0,
            OpcodesEnum.JUMP,
            OpcodesEnum.PUSH,
            99,
            OpcodesEnum.STOP,
          ]).result
        ).toEqual(99);
      });
    });
    describe('and the code includes an invalid JUMP destination', () => {
      it('throws an error', () => {
        expect(() =>
          new Interpreter().runCode([
            OpcodesEnum.PUSH,
            6,
            OpcodesEnum.JUMP,
            OpcodesEnum.STOP,
          ])
        ).toThrow();
      });
    });
    describe('and the code includes an invalid PUSH value', () => {
      it('throws an error', () => {
        expect(() =>
          new Interpreter().runCode([OpcodesEnum.PUSH, 0, OpcodesEnum.PUSH])
        ).toThrow();
      });
    });
    describe('and the code includes an infinite loop', () => {
      it('throws an error', () => {
        expect(() =>
          new Interpreter().runCode([OpcodesEnum.PUSH, 0, OpcodesEnum.JUMP])
        ).toThrow();
      });
    });
    it('and the code includes STORE', () => {
      const interpreter = new Interpreter({ storageTrie: new Trie() });
      const key = 'foo';
      const value = 'bar';
      const code = [
        OpcodesEnum.PUSH,
        value,
        OpcodesEnum.PUSH,
        key,
        OpcodesEnum.STORE,
        OpcodesEnum.STOP,
      ];
      interpreter.runCode(code);
      expect(interpreter.storageTrie.get({ key })).toEqual(value);
    });
    it('and the code includes LOAD', () => {
      const interpreter = new Interpreter({ storageTrie: new Trie() });
      const key = 'foo';
      const value = 'bar';
      const code = [
        OpcodesEnum.PUSH,
        value,
        OpcodesEnum.PUSH,
        key,
        OpcodesEnum.STORE,
        OpcodesEnum.PUSH,
        key,
        OpcodesEnum.LOAD,
        OpcodesEnum.STOP,
      ];
      const { result } = interpreter.runCode(code);
      expect(result).toEqual(value);
    });
  });
});
