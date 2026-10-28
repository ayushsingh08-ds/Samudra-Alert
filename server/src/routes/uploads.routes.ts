import { Router } from 'express';
import * as uploads from '../controllers/uploads.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/presign', requireAuth, uploads.presign);
router.post('/confirm', requireAuth, uploads.confirm);

export default router;
