import { config } from 'dotenv';
config();

import express from 'express';
import { Application } from 'express';
import { json } from 'body-parser';
import cors from 'cors';

import log from './helpers/logger'
import modelRouter from './routers/model-router';


const app = express();
app.use(json());
app.use(cors());

app.use('/model', modelRouter);

app.listen(process.env.PORT, () => {
  log(`Server running on port ${process.env.PORT}`);
})