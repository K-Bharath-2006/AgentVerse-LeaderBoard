import { Router } from 'express';
import { createTeam, joinTeam, getMyTeam, getAllTeams } from '../controllers/team.controller';
import { protect } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTeamSchema, joinTeamSchema } from '../validators/team.validator';

const router = Router();

router.post('/', protect, requireRole('student'), validate(createTeamSchema), createTeam);
router.post('/join', protect, requireRole('student'), validate(joinTeamSchema), joinTeam);
router.get('/my', protect, requireRole('student'), getMyTeam);
router.get('/', protect, requireRole('admin', 'faculty_jury', 'alumni_jury', 'industry_jury'), getAllTeams);

export default router;
