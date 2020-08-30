import express from 'express';
import axios from 'axios';
import Blockchain from './blockchain/Blockchain';
import Block from './blockchain/Block';
import Pubsub from './pubsub/pubsub';

const app = express();
const blockchain = new Blockchain();
const pubsub = new Pubsub({ blockchain });

app.get('/blockchain', (req, res, next) => {
  const { chain } = blockchain;
  res.json({ chain });
});

app.get('/blockchain/mine', async (req, res, next) => {
  const lastBlock = blockchain.lastBlock();

  const block = Block.mineBlock({ lastBlock, beneficiary: 'a' });

  try {
    await blockchain.addBlock({ block });
    await pubsub.broadcastBlock(block);
    res.json({ block });
  } catch (error) {
    next(error);
  }
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
