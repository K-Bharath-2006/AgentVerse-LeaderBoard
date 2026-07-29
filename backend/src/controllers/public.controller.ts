import { Request, Response, NextFunction } from 'express';
import { Agent } from '../models/Agent.model';
import { Team } from '../models/Team.model';
import { User } from '../models/User.model';
import { Event } from '../models/Event.model';
import { JuryScore } from '../models/JuryScore.model';

export const getPublicDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const approvedAgents = await Agent.countDocuments({ status: 'approved' });
    
    // Group agents by team department to get department count
    const approvedAgentsList = await Agent.find({ status: 'approved' }).populate('teamId', 'department');
    const depts = new Set(approvedAgentsList.map(a => (a.teamId as any)?.department).filter(Boolean));
    const departmentsCount = depts.size;
    
    const students = await User.countDocuments({ role: 'student' });
    const teams = await Team.countDocuments();
    const juries = await User.countDocuments({ role: { $in: ['faculty_jury', 'alumni_jury', 'industry_jury'] } });

    res.status(200).json({
      approvedAgents,
      departments: departmentsCount,
      students,
      teams,
      juries,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentRanking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = await Agent.find({ status: 'approved' }).populate('teamId', 'department');
    
    const deptMap: Record<string, { approvedAgents: number, teams: Set<string> }> = {};

    agents.forEach(agent => {
      const team = agent.teamId as any;
      const dept = team?.department || (agent as any).department || 'Unknown';
      
      if (!deptMap[dept]) {
        deptMap[dept] = { approvedAgents: 0, teams: new Set() };
      }
      
      const record = deptMap[dept];
      if (record) {
        record.approvedAgents += 1;
        if (team) {
          record.teams.add(team._id.toString());
        }
      }
    });

    const ranking = Object.entries(deptMap).map(([dept, record]) => ({
      department: dept,
      approvedAgents: record.approvedAgents,
      teamsCount: record.teams.size,
    })).sort((a, b) => b.approvedAgents - a.approvedAgents);

    res.status(200).json(ranking);
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department, section, top10 } = req.query;

    let teamQuery: any = {};
    if (department) teamQuery.department = department;
    if (section) teamQuery.section = section;

    const teams = await Team.find(teamQuery);
    
    // Aggregate scores
    const scores = await JuryScore.find();
    const agents = await Agent.find({ status: 'approved' });

    const leaderboard = teams.map(team => {
      const teamScores = scores.filter(s => s.teamId.toString() === team._id.toString());
      
      let avgScore = 0;
      if (teamScores.length > 0) {
        const total = teamScores.reduce((acc, curr) => acc + curr.score, 0);
        avgScore = total / teamScores.length;
      }

      const teamAgents = agents.filter(a => a.teamId.toString() === team._id.toString());

      return {
        id: team._id,
        teamName: team.name,
        department: team.department,
        section: team.section,
        approvedAgentCount: teamAgents.length,
        _rawScore: avgScore // private, used for sorting only
      };
    });

    // Sort by avgScore desc, then by approvedAgentCount desc, then by teamName asc
    leaderboard.sort((a, b) => {
      if (b._rawScore !== a._rawScore) return b._rawScore - a._rawScore;
      if (b.approvedAgentCount !== a.approvedAgentCount) return b.approvedAgentCount - a.approvedAgentCount;
      return a.teamName.localeCompare(b.teamName);
    });

    // Add rank and strip private score
    const finalLeaderboard = leaderboard.map((item, index) => {
      const { _rawScore, ...rest } = item;
      return {
        ...rest,
        rank: index + 1
      };
    });

    if (top10 === 'true') {
      return res.status(200).json(finalLeaderboard.slice(0, 10));
    }

    res.status(200).json(finalLeaderboard);
  } catch (error) {
    next(error);
  }
};

export const getPublicEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.findOne();
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const getLatestActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = await Agent.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('teamId', 'department');
    
    const activities = agents.map(a => ({
      id: a._id,
      department: (a.teamId as any)?.department || 'Unknown',
      teamName: a.teamName,
      agentName: a.agentName,
      type: a.status,
      timestamp: a.createdAt
    }));

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};
