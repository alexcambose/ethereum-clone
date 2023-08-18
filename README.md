# ethereum-clone
A basic implementation of Ethereum and EVM. It implements a blockchain, EOA, and interpreter with a few opcodes like PUSH, STORE, LOAD, JUMP, and more.

```ts
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
const {
  transaction: {
    data: { accountData: smartContractData },
  },
} = await postTransact({ code });
console.log(smartContractData);
// @ts-ignore
await getMine();
await postTransact({
  to: smartContractData.codeHash,
  value: 10,
  gasLimit: 100,
});
await getMine();
```
