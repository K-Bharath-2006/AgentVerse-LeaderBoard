import { Router } from 'express';
import { getJuryTeams, getJuryTeamDetail, submitTeamScore, getMyScores, updateAgentStatusJury } from '../controllers/jury.controller';
import { protect } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { scoreTeamSchema } from '../validators/jury.validator';
import { updateAgentStatusSchema } from '../validators/admin.validator';

const router = Router();

// Apply auth and role middleware to all jury routes
router.use(protect);
router.use(requireRole('faculty_jury', 'alumni_jury', 'industry_jury'));

router.get('/teams', getJuryTeams);
router.get('/teams/:id', getJuryTeamDetail);
router.post('/score', validate(scoreTeamSchema), submitTeamScore);
router.get('/my-scores', getMyScores);
router.put('/agents/:id/status', validate(updateAgentStatusSchema), updateAgentStatusJury);

export default router;
