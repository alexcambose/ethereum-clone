enum Opcodes {
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
  code: (Opcodes | number)[];
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
          case Opcodes.STOP:
            throw new Error(EXECUTION_COMPLETE);
          case Opcodes.PUSH: {
            this.state.programCounter++;
            if (this.state.programCounter === this.state.code.length) {
              throw new Error(`Push code cannot be last`);
            }
            const value = this.state.code[this.state.programCounter];
            this.state.stack.push(value);
            break;
          }
          case Opcodes.ADD:
          case Opcodes.SUB:
          case Opcodes.MUL:
          case Opcodes.DIV:
          case Opcodes.LT:
          case Opcodes.GT:
          case Opcodes.EQ:
          case Opcodes.AND:
          case Opcodes.OR: {
            const a = this.state.stack.pop();
            const b = this.state.stack.pop();
            let result;
            if (opCode === Opcodes.ADD) result = a + b;
            if (opCode === Opcodes.SUB) result = a - b;
            if (opCode === Opcodes.MUL) result = a * b;
            if (opCode === Opcodes.DIV) result = a / b;
            if (opCode === Opcodes.LT) result = a < b ? 1 : 0;
            if (opCode === Opcodes.GT) result = a > b ? 1 : 0;
            if (opCode === Opcodes.EQ) result = a === b ? 1 : 0;
            if (opCode === Opcodes.AND) result = a && b;
            if (opCode === Opcodes.OR) result = a || b;
            this.state.stack.push(result);
            break;
          }
          case Opcodes.JUMP: {
            this.jump();
            break;
          }
          case Opcodes.JUMPI: {
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
const code = [Opcodes.PUSH, 0, Opcodes.JUMP];

const interpreter = new Interpreter();
console.log(interpreter.runCode(code));
