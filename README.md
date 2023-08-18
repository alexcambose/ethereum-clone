# ethereum-clone
A very basic implementation of how Ethereum and EVM works, also implements a few opcodes

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
