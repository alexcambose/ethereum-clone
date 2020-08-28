export enum OpcodesEnum {
  STOP,
  ADD,
  PUSH,
  SUB,
  MUL,
  DIV,
  LT,
  GT,
  EQ,
  AND,
  OR,
  JUMP,
  JUMPI,
}
const EXECUTION_COMPLETE = "Execution complete";
const EXECUTION_LIMIT = 10000;

type State = {
  programCounter: number;
  stack: number[];
  code: (OpcodesEnum | number)[];
  executionCount: number;
};

class Interpreter {
  state: State;
  constructor() {
    this.state = {
      programCounter: 0,
      stack: [],
      code: [],
      executionCount: 0,
    };
  }
  runCode(code) {
    this.state.code = code;

    while (this.state.programCounter < this.state.code.length) {
      this.state.executionCount++;
      if (this.state.executionCount > EXECUTION_LIMIT) {
        throw new Error(
          `Check for infinite loop. Execution limit of ${EXECUTION_LIMIT} exceeded!`
        );
      }
      const opCode = code[this.state.programCounter];
      try {
        switch (opCode) {
          case OpcodesEnum.STOP:
            throw new Error(EXECUTION_COMPLETE);
          case OpcodesEnum.PUSH: {
            this.state.programCounter++;
            if (this.state.programCounter === this.state.code.length) {
              throw new Error(`Push code cannot be last`);
            }
            const value = this.state.code[this.state.programCounter];
            this.state.stack.push(value);
            break;
          }
          case OpcodesEnum.ADD:
          case OpcodesEnum.SUB:
          case OpcodesEnum.MUL:
          case OpcodesEnum.DIV:
          case OpcodesEnum.LT:
          case OpcodesEnum.GT:
          case OpcodesEnum.EQ:
          case OpcodesEnum.AND:
          case OpcodesEnum.OR: {
            const a = this.state.stack.pop();
            const b = this.state.stack.pop();
            let result;
            if (opCode === OpcodesEnum.ADD) result = a + b;
            if (opCode === OpcodesEnum.SUB) result = a - b;
            if (opCode === OpcodesEnum.MUL) result = a * b;
            if (opCode === OpcodesEnum.DIV) result = a / b;
            if (opCode === OpcodesEnum.LT) result = a < b ? 1 : 0;
            if (opCode === OpcodesEnum.GT) result = a > b ? 1 : 0;
            if (opCode === OpcodesEnum.EQ) result = a === b ? 1 : 0;
            if (opCode === OpcodesEnum.AND) result = a && b;
            if (opCode === OpcodesEnum.OR) result = a || b;
            this.state.stack.push(result);
            break;
          }
          case OpcodesEnum.JUMP: {
            this.jump();
            break;
          }
          case OpcodesEnum.JUMPI: {
            if (this.state.stack.pop()) {
              this.jump();
            }
            break;
          }
          default:
            break;
        }
      } catch (error) {
        if (error.message === EXECUTION_COMPLETE) {
          return this.state.stack[this.state.stack.length - 1];
        } else {
          throw error;
        }
      }
      this.state.programCounter++;
    }
  }
  jump() {
    const destination = this.state.stack.pop();
    if (destination < 0 || destination > this.state.code.length) {
      throw new Error(`Invalid destination ${destination}`);
    }
    this.state.programCounter = destination;
    this.state.programCounter--;
  }
}
export default Interpreter;
