import express from 'express';
import axios from 'axios';
import Blockchain from './blockchain/Blockchain';
import Block from './blockchain/Block';
import Pubsub from './pubsub/pubsub';
import TransactionQueue from './transaction/TransactionQueue';
import Account from './account/Account';
import Transaction from './transaction/Transaction';
import bodyParser from 'body-parser';
import State from './store/State';

const app = express();
app.use(bodyParser.json());
const state = new State();
const blockchain = new Blockchain({ state });
const account = new Account();
const transactionQueue = new TransactionQueue();
const pubsub = new Pubsub({ blockchain, transactionQueue });
const transaction = Transaction.createTransaction({ account });
setTimeout(() => pubsub.broadcastTransaction(transaction), 1500);
console.log('My account address is: ', account.address);
app.get('/blockchain', (req, res, next) => {
  const { chain } = blockchain;
  res.json({ chain });
});

app.get('/blockchain/mine', async (req, res, next) => {
  const lastBlock = blockchain.lastBlock();

  const block = Block.mineBlock({
    lastBlock,
    beneficiary: account.address,
    transactionSeries: transactionQueue.getTransactionSeries(),
    stateRoot: state.getStateRoot(),
  });

  try {
    await blockchain.addBlock({ block, transactionQueue });
    await pubsub.broadcastBlock(block);
    res.json({ block });
  } catch (error) {
    next(error);
  }
});

app.post('/account/transact', (req, res) => {
  const { to, value, code, gasLimit } = req.body;
  const transaction = Transaction.createTransaction({
    account: !to ? new Account({ code }) : account,
    to,
    value,
    gasLimit,
  });
  pubsub.broadcastTransaction(transaction);
  res.json({ transaction });
});

app.get('/account/balance', (req, res) => {
  const { address } = req.query;
  const targetAddress = address ? address.toString() : account.address;
  console.log(`Getting balance for address: ${targetAddress}`);
  console.log(JSON.stringify(state));
  const balance = Account.calculateBalance({
    address: targetAddress,
    state,
  });
  res.json({ balance });
});

app.use((err, req, res, next) => {
  console.error('Internal server error', err);
  res.status(500).json({ message: err.message });
});

const IS_PEER = process.argv.includes('--peer');
const PORT = IS_PEER ? Math.floor(Math.random() * 100 + 3000) : 3000;

if (IS_PEER) {
  axios.get(`http://localhost:${3000}/blockchain`).then(async (res) => {
    const { chain } = res.data;
    await blockchain.replaceChain({ chain });
    console.log(`*-- Blockchain synced --*`);
  });
}

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
