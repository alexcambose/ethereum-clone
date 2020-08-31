import axios from 'axios';
import { OpcodesEnum } from './interpreter/Interpreter';

const BASE_URL = 'http://localhost:3000';

const postTransact = async ({
  to = undefined,
  value = undefined,
  code = undefined,
}) => {
  console.log(
    `POST ${BASE_URL}/account/transact with ${JSON.stringify({
      to,
      value,
      code,
    })}`
  );
  const { data } = await axios.post(`${BASE_URL}/account/transact`, {
    to,
    value,
    code,
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
  const code = [
    OpcodesEnum.PUSH,
    4,
    OpcodesEnum.PUSH,
    5,
    OpcodesEnum.ADD,
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
  await postTransact({ to: smartContractData.codeHash, value: 0 });
  await getMine();

  // console.log(await getBalance({ address: accountData.address }));
})();
