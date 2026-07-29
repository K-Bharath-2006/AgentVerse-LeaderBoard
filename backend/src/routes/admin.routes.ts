import { Router } from 'express';
import {
  getStudents, blockStudent, resetPassword, moveStudent, removeStudentFromTeam,
  getAllAgentsAdmin, updateAgentStatus,
  createJury, getJuries,
  getEvent, updateEvent, startEvent, resetEvent,
  getAnalytics, exportStudentReport,
  getTeamsAdmin, getOverallReportAdmin, exportTeamReport, exportOverallReport
} from '../controllers/admin.controller';
import { protect } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateAgentStatusSchema, eventSchema, moveStudentSchema, createJurySchema } from '../validators/admin.validator';

const router = Router();

router.use(protect);
router.use(requireRole('admin'));

// Students
router.get('/students', getStudents);
router.put('/students/:id/block', blockStudent);
router.put('/students/:id/reset-password', resetPassword);
router.put('/students/move', validate(moveStudentSchema), moveStudent);
router.put('/students/remove-team', removeStudentFromTeam);

// Teams
router.get('/teams', getTeamsAdmin);

// Agents
router.get('/agents', getAllAgentsAdmin);
router.put('/agents/:id/status', validate(updateAgentStatusSchema), updateAgentStatus);

// Juries
router.post('/jury', validate(createJurySchema), createJury);
router.get('/jury', getJuries);

// Event
router.get('/event', getEvent);
router.put('/event', validate(eventSchema), updateEvent);
router.post('/event/start', startEvent);
router.post('/event/reset', resetEvent);

// Analytics & Reports
router.get('/reports/overall', getOverallReportAdmin);
router.get('/reports/export/students', exportStudentReport);
router.get('/reports/export/teams', exportTeamReport);
router.get('/reports/export/overall', exportOverallReport);
router.get('/analytics', getAnalytics);

export default router;
