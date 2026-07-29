import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import ExcelJS from 'exceljs';
import { User } from '../models/User.model';
import { Team } from '../models/Team.model';
import { Agent } from '../models/Agent.model';
import { Event } from '../models/Event.model';
import { JuryScore } from '../models/JuryScore.model';
import { io } from '../server';

// --- Student Management ---
export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const department = (req.query.department as string) || '';
    const section = (req.query.section as string) || '';
    
    let query: any = { role: 'student' };
    
    if (search) {
      const matchConditions: any[] = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];

      // Also search by team name
      const matchingTeams = await Team.find({ name: { $regex: search, $options: 'i' } });
      if (matchingTeams.length > 0) {
        const teamIds = matchingTeams.map(t => t._id);
        matchConditions.push({ teamId: { $in: teamIds } });
      }

      query.$or = matchConditions;
    }
    
    if (department) {
      query.department = department;
    }
    
    if (section) {
      query.section = section;
    }

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .populate('teamId', 'name')
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      students,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const blockStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    const student = await User.findByIdAndUpdate(id, { isBlocked }, { new: true });
    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const moveStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, newTeamId } = req.body;
    
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      res.status(404);
      throw new Error('Student not found');
    }

    const newTeam = await Team.findById(newTeamId);
    if (!newTeam) {
      res.status(404);
      throw new Error('New team not found');
    }

    if (newTeam.members.length >= 3) {
      res.status(400);
      throw new Error('Target team is already full');
    }

    // Remove from old team if exists and handle cleanup
    if (student.teamId) {
      const oldTeamId = student.teamId;
      await Team.findByIdAndUpdate(oldTeamId, {
        $pull: { members: studentId }
      });
      const oldTeam = await Team.findById(oldTeamId);
      if (oldTeam) {
        if (oldTeam.members.length === 0) {
          await Team.findByIdAndDelete(oldTeamId);
        } else if (oldTeam.leaderId && oldTeam.leaderId.toString() === studentId.toString()) {
          oldTeam.leaderId = oldTeam.members[0]!;
          await oldTeam.save();
        }
      }
    }

    // Add to new team
    newTeam.members.push(studentId);
    await newTeam.save();

    student.teamId = newTeamId as any;
    await student.save();

    res.status(200).json({ message: 'Student moved successfully' });
  } catch (error) {
    next(error);
  }
};

export const removeStudentFromTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      res.status(404);
      throw new Error('Student not found');
    }

    if (!student.teamId) {
      res.status(400);
      throw new Error('Student is not in any team');
    }

    const teamId = student.teamId;

    await Team.findByIdAndUpdate(teamId, {
      $pull: { members: studentId }
    });

    const team = await Team.findById(teamId);
    if (team) {
      if (team.members.length === 0) {
        await Team.findByIdAndDelete(teamId);
      } else if (team.leaderId.toString() === studentId.toString()) {
        team.leaderId = team.members[0]!;
        await team.save();
      }
    }

    student.teamId = undefined;
    await student.save();

    res.status(200).json({ message: 'Student removed from team successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Team Management ---
export const getTeamsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const department = (req.query.department as string) || '';
    const section = (req.query.section as string) || '';

    let query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (department) {
      query.department = department;
    }
    if (section) {
      query.section = section;
    }

    const total = await Team.countDocuments(query);
    const teams = await Team.find(query)
      .populate('members', 'name rollNumber department section year')
      .skip((page - 1) * limit)
      .limit(limit);

    const teamIds = teams.map(t => t._id);
    const agents = await Agent.find({ teamId: { $in: teamIds } });

    const teamsWithCounts = teams.map(team => {
      const teamAgents = agents.filter(a => a.teamId.toString() === team._id.toString());
      return {
        ...team.toObject(),
        submittedCount: teamAgents.length,
        approvedCount: teamAgents.filter(a => a.status === 'approved').length,
        rejectedCount: teamAgents.filter(a => a.status === 'rejected').length
      };
    });

    res.status(200).json({
      teams: teamsWithCounts,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

// --- Agent Management ---
export const getAllAgentsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = await Agent.find().populate('teamId', 'name department');
    res.status(200).json(agents);
  } catch (error) {
    next(error);
  }
};

export const updateAgentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const agent = await Agent.findByIdAndUpdate(id, { status }, { new: true });
    if (!agent) {
      res.status(404);
      throw new Error('Agent not found');
    }

    io.emit('dashboard:update');
    io.emit('leaderboard:update');
    io.emit('agent:statusChange', agent);

    res.status(200).json(agent);
  } catch (error) {
    next(error);
  }
};

// --- Jury Management ---
export const createJury = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { juryId, password, role, name } = req.body;

    const exists = await User.findOne({ juryId });
    if (exists) {
      res.status(400);
      throw new Error('Jury ID already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const jury = await User.create({
      juryId,
      name,
      password: hashedPassword,
      role
    });

    res.status(201).json({ juryId: jury.juryId, role: jury.role, name: jury.name });
  } catch (error) {
    next(error);
  }
};

export const getJuries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const juries = await User.find({ role: { $in: ['faculty_jury', 'alumni_jury', 'industry_jury'] } }).select('-password');
    res.status(200).json(juries);
  } catch (error) {
    next(error);
  }
};

// --- Event Control ---
export const getEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let event = await Event.findOne();
    if (!event) {
      event = await Event.create({
        startDate: new Date('2026-07-29T09:00:00.000Z'),
        endDate: new Date('2026-07-31T16:00:00.000Z'),
        isStarted: false
      });
    }
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.body;
    let event = await Event.findOne();
    if (event) {
      event.startDate = startDate;
      event.endDate = endDate;
      await event.save();
    } else {
      event = await Event.create({
        startDate,
        endDate,
        isStarted: false
      });
    }
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const startEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let event = await Event.findOne();
    if (!event) {
      event = await Event.create({
        startDate: new Date('2026-07-29T09:00:00.000Z'),
        endDate: new Date('2026-07-31T16:00:00.000Z'),
        isStarted: true,
        startedAt: new Date(),
      });
    } else {
      event.isStarted = true;
      event.startedAt = new Date();
      await event.save();
    }
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const resetEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.findOneAndUpdate(
      {},
      {
        $set: {
          isStarted: false,
          startedAt: undefined,
        }
      },
      { new: true, upsert: true }
    );
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

// --- Analytics & Reports ---
export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeams = await Team.countDocuments();
    const totalAgents = await Agent.countDocuments();
    const approvedAgents = await Agent.countDocuments({ status: 'approved' });

    res.status(200).json({
      totalStudents,
      totalTeams,
      totalAgents,
      approvedAgents
    });
  } catch (error) {
    next(error);
  }
};

export const getOverallReportAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department, section } = req.query;

    let userQuery: any = { role: 'student' };
    let teamQuery: any = {};

    if (department) {
      userQuery.department = department;
      teamQuery.department = department;
    }
    if (section) {
      userQuery.section = section;
      teamQuery.section = section;
    }

    const studentCount = await User.countDocuments(userQuery);
    const teamCount = await Team.countDocuments(teamQuery);

    let approvedAgentCount = 0;
    if (department || section) {
      const matchingTeams = await Team.find(teamQuery);
      const teamIds = matchingTeams.map(t => t._id);
      approvedAgentCount = await Agent.countDocuments({
        status: 'approved',
        teamId: { $in: teamIds }
      });
    } else {
      approvedAgentCount = await Agent.countDocuments({ status: 'approved' });
    }

    const teams = await Team.find(teamQuery);
    const students = await User.find(userQuery);

    const teamIds = teams.map(t => t._id);
    const agents = await Agent.find({ 
      status: 'approved', 
      teamId: { $in: teamIds } 
    });

    const deptMap: Record<string, { studentCount: number, teamCount: number, approvedAgents: number }> = {};

    teams.forEach(t => {
      const dept = t.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { studentCount: 0, teamCount: 0, approvedAgents: 0 };
      }
      deptMap[dept].teamCount += 1;
    });

    students.forEach(s => {
      const dept = s.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { studentCount: 0, teamCount: 0, approvedAgents: 0 };
      }
      deptMap[dept].studentCount += 1;
    });

    agents.forEach(a => {
      const team = teams.find(t => t._id.toString() === a.teamId.toString());
      const dept = team?.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { studentCount: 0, teamCount: 0, approvedAgents: 0 };
      }
      deptMap[dept].approvedAgents += 1;
    });

    const breakdown = Object.entries(deptMap).map(([dept, data]) => ({
      department: dept,
      ...data
    }));

    res.status(200).json({
      summary: {
        studentCount,
        teamCount,
        approvedAgentCount
      },
      breakdown
    });
  } catch (error) {
    next(error);
  }
};

export const exportStudentReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string) || '';
    const department = (req.query.department as string) || '';
    const section = (req.query.section as string) || '';

    let query: any = { role: 'student' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
      const matchingTeams = await Team.find({ name: { $regex: search, $options: 'i' } });
      if (matchingTeams.length > 0) {
        const teamIds = matchingTeams.map(t => t._id);
        query.$or.push({ teamId: { $in: teamIds } });
      }
    }
    if (department) query.department = department;
    if (section) query.section = section;

    const students = await User.find(query).populate('teamId');
    const agents = await Agent.find();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Students');

    sheet.columns = [
      { header: 'S.No', key: 'sno', width: 10 },
      { header: 'Roll Number', key: 'rollNumber', width: 20 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Section', key: 'section', width: 15 },
      { header: 'Team Name', key: 'teamName', width: 30 },
      { header: 'Submitted Agents', key: 'submitted', width: 20 },
      { header: 'Approved Agents', key: 'approved', width: 20 },
      { header: 'Rejected Agents', key: 'rejected', width: 20 },
    ];

    students.forEach((student, index) => {
      const studentAgents = agents.filter(a => a.submittedBy.toString() === student._id.toString());
      const approved = studentAgents.filter(a => a.status === 'approved').length;
      const rejected = studentAgents.filter(a => a.status === 'rejected').length;

      sheet.addRow({
        sno: index + 1,
        rollNumber: student.rollNumber,
        name: student.name,
        department: student.department,
        section: student.section,
        teamName: student.teamId ? (student.teamId as any).name : 'No Team',
        submitted: studentAgents.length,
        approved,
        rejected
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Student_Report.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

export const exportTeamReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string) || '';
    const department = (req.query.department as string) || '';
    const section = (req.query.section as string) || '';

    let query: any = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (department) query.department = department;
    if (section) query.section = section;

    const teams = await Team.find(query).populate('members', 'name rollNumber');
    const agents = await Agent.find();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Teams');

    sheet.columns = [
      { header: 'S.No', key: 'sno', width: 10 },
      { header: 'Team Name', key: 'teamName', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Section', key: 'section', width: 15 },
      { header: 'Members', key: 'members', width: 40 },
      { header: 'Submitted Agents', key: 'submitted', width: 20 },
      { header: 'Approved Agents', key: 'approved', width: 20 },
      { header: 'Rejected Agents', key: 'rejected', width: 20 },
    ];

    teams.forEach((team, index) => {
      const teamAgents = agents.filter(a => a.teamId.toString() === team._id.toString());
      const approved = teamAgents.filter(a => a.status === 'approved').length;
      const rejected = teamAgents.filter(a => a.status === 'rejected').length;
      const memberNames = team.members.filter(Boolean).map((m: any) => `${m.name} (${m.rollNumber})`).join(', ');

      sheet.addRow({
        sno: index + 1,
        teamName: team.name,
        department: team.department,
        section: team.section,
        members: memberNames,
        submitted: teamAgents.length,
        approved,
        rejected
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Team_Report.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

export const exportOverallReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await Team.find();
    const students = await User.find({ role: 'student' });
    const agents = await Agent.find({ status: 'approved' });

    const deptMap: Record<string, { studentCount: number, teamCount: number, approvedAgents: number }> = {};

    teams.forEach(t => {
      const dept = t.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { studentCount: 0, teamCount: 0, approvedAgents: 0 };
      }
      deptMap[dept].teamCount += 1;
    });

    students.forEach(s => {
      const dept = s.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { studentCount: 0, teamCount: 0, approvedAgents: 0 };
      }
      deptMap[dept].studentCount += 1;
    });

    agents.forEach(a => {
      const team = teams.find(t => t._id.toString() === a.teamId.toString());
      const dept = team?.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { studentCount: 0, teamCount: 0, approvedAgents: 0 };
      }
      deptMap[dept].approvedAgents += 1;
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Overall Overview');

    sheet.columns = [
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Students Registered', key: 'students', width: 25 },
      { header: 'Teams Created', key: 'teams', width: 25 },
      { header: 'Approved Agents', key: 'approved', width: 25 },
    ];

    Object.entries(deptMap).forEach(([dept, data]) => {
      sheet.addRow({
        department: dept,
        students: data.studentCount,
        teams: data.teamCount,
        approved: data.approvedAgents
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Overall_Report.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
