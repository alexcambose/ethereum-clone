import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const postTransact = ({ to = undefined, value = undefined }) =>
  axios.post(`${BASE_URL}/account/transact`, { to, value });
const getMine = () => axios.get(`${BASE_URL}/blockchain/mine`);

(async () => {
  let {
    data: {
      transaction: {
        data: { accountData },
      },
    },
  } = await postTransact({});
  let { data } = await postTransact({ to: accountData.address, value: '50' });

  console.log(data);
  setTimeout(async () => console.log((await getMine()).data), 2000);
})();
