import { Router } from 'express';
import { submitAgent, getMyAgents, getAllAgents, updateAgent, deleteAgent } from '../controllers/agent.controller';
import { protect } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { submitAgentSchema } from '../validators/agent.validator';

const router = Router();

router.post('/', protect, requireRole('student'), validate(submitAgentSchema), submitAgent);
router.get('/my', protect, requireRole('student'), getMyAgents);
router.get('/', protect, requireRole('admin', 'faculty_jury', 'alumni_jury', 'industry_jury'), getAllAgents);
router.put('/:id', protect, requireRole('student'), validate(submitAgentSchema), updateAgent);
router.delete('/:id', protect, requireRole('student'), deleteAgent);

export default router;
