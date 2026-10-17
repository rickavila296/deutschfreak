import type { Db } from '@deutschfreak/db';
import { lessonParamsSchema } from '@deutschfreak/validation';
import { Router } from 'express';
import { parseRequest } from '../errors.ts';
import { getLesson } from '../services/lesson.ts';

/** `GET /v1/lessons/:slug` (TRD-API-03). The route only validates and delegates (TRD-BE-02, TRD-BE-03). */
export function lessonsRouter(db: Db): Router {
  const router = Router();
  router.get('/lessons/:slug', async (req, res) => {
    const { slug } = parseRequest(lessonParamsSchema, req.params);
    res.json(await getLesson(db, slug));
  });
  return router;
}
