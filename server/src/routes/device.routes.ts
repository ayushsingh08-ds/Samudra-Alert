import { Router } from 'express';
import * as deviceController from '../controllers/device.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', requireAuth, deviceController.registerDevice);
router.delete('/:token', requireAuth, deviceController.removeDevice);

export default router;
