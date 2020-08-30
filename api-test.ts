import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const postTransact = ({ to = undefined, value = undefined }) =>
  axios.post(`${BASE_URL}/account/transact`, { to, value });
const getMine = () =>
  new Promise((resolve) => {
    setTimeout(async () => {
      axios.get(`${BASE_URL}/blockchain/mine`).then(resolve);
    }, 1000);
  });

(async () => {
  let {
    data: {
      transaction: {
        data: { accountData },
      },
    },
  } = await postTransact({});
  // @ts-ignore
  console.log((await getMine()).data);

  let { data } = await postTransact({ to: accountData.address, value: 20 });

  // @ts-ignore
  console.log((await getMine()).data);
})();
