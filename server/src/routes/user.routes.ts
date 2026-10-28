import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import User from '../models/User.model';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user!.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router;
