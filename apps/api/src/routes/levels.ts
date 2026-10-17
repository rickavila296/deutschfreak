import type { Db } from '@deutschfreak/db';
import { levelMapParamsSchema } from '@deutschfreak/validation';
import { Router } from 'express';
import { parseRequest } from '../errors.ts';
import { getLevelMap } from '../services/level-map.ts';

/** `GET /v1/levels/:code/map` (TRD-API-02). The route only validates and delegates (TRD-BE-02, TRD-BE-03). */
export function levelsRouter(db: Db): Router {
  const router = Router();
  router.get('/levels/:code/map', async (req, res) => {
    const { code } = parseRequest(levelMapParamsSchema, req.params);
    res.json(await getLevelMap(db, code));
  });
  return router;
}
