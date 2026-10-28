import { Router } from 'express';
import * as alertController from '../controllers/alert.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', alertController.getAlerts);
router.post('/', requireAuth, requireRole(['admin']), alertController.createAlert);

export default router;
