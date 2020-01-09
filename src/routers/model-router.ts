import { Router, application } from 'express';
import Model from '../services/runtime-service';
import log from '../helpers/logger';
const modelRouter = Router();

const model = require('../services/model.json');
const activeModel = new Model(model);

modelRouter.post('/test', (req, res, next) => {
  const x = req.body?.point?.x;
  const y = req.body?.point?.y;
  const entities = req.body?.input?.entities;
  const nuances = req.body?.input?.nuances;
  
  if(x === null || y === null || !entities) {
    res.sendStatus(400);
    return;
  }

  activeModel.validateInput(entities);
  const entry = activeModel.query(x, y);
  const response = activeModel.generate(entry, entities, nuances)
  res.json(response).send()
})

export default modelRouter;