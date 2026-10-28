import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { getAdminStats } from '../controllers/report.controller';

const router = Router();

router.use(requireAuth, requireRole(['moderator', 'admin']));

// Verification queue
router.get('/reports/pending', async (req, res) => {
  const Report = (await import('../models/Report.model')).default;
  const reports = await Report.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .populate('createdBy', 'name');
  res.json(reports);
});

// Rich stats (delegates to report controller)
router.get('/stats', getAdminStats);

export default router;
