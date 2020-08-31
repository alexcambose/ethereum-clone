import axios from 'axios';
import { OpcodesEnum } from './interpreter/Interpreter';

const BASE_URL = 'http://localhost:3000';

const postTransact = async ({
  to = undefined,
  value = undefined,
  code = undefined,
  gasLimit = undefined,
}) => {
  console.log(
    `POST ${BASE_URL}/account/transact with ${JSON.stringify({
      to,
      value,
      code,
      gasLimit,
    })}`
  );
  const { data } = await axios.post(`${BASE_URL}/account/transact`, {
    to,
    value,
    code,
    gasLimit,
  });
  console.log('TRANSACT', data);
  return data;
};
const getMine = () =>
  new Promise((resolve) => {
    setTimeout(async () => {
      console.log(`${BASE_URL}/blockchain/mine`);
      // @ts-ignore
      const { data } = await axios.get(`${BASE_URL}/blockchain/mine`);
      console.log('MINED', data);
      resolve(data);
    }, 5000);
  });
const getBalance = async ({ address = undefined } = {}) =>
  (
    await axios.get(
      `${BASE_URL}/account/balance${address ? `?address=${address}` : ''}`
    )
  ).data;
(async () => {
  // let {
  //   // @ts-ignore
  //   transaction: {
  //     data: { accountData },
  //   },
  // } = await postTransact({});
  //
  // await getMine();
  //
  // await postTransact({ to: accountData.address, value: 20 });
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

  // console.log(await getBalance({ address: accountData.address }));
})();
