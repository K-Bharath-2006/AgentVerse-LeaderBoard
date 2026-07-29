import { Router } from 'express';
import { getPublicDashboard, getDepartmentRanking, getLeaderboard, getPublicEvent, getLatestActivity } from '../controllers/public.controller';

const router = Router();

router.get('/dashboard/stats', getPublicDashboard);
router.get('/dashboard/departments', getDepartmentRanking);
router.get('/leaderboard', getLeaderboard);
router.get('/event', getPublicEvent);
router.get('/dashboard/activity', getLatestActivity);

export default router;
