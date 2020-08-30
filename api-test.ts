import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const postTransact = ({ to = undefined, value = undefined }) =>
  axios.post(`${BASE_URL}/account/transact`, { to, value });

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
})();
