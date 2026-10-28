import { Router } from 'express';
import * as ReportController from '../controllers/report.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', ReportController.getReports);
router.get('/nearby', ReportController.getNearbyReports);
router.get('/:id', ReportController.getReportById);

router.post('/', requireAuth, ReportController.createReport);
router.patch('/:id/status', requireAuth, requireRole(['moderator', 'admin']), ReportController.updateReportStatus);

export default router;
