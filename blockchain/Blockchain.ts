import Block from "./Block";

export default class Blockchain {
  chain: Block[] = [Block.genesis()];
  constructor() {}
}
