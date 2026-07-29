import { Request, Response, NextFunction } from 'express';
import { JuryScore } from '../models/JuryScore.model';
import { Team } from '../models/Team.model';
import { Agent } from '../models/Agent.model';
import { io } from '../server';

export const getJuryTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year, department, section, search } = req.query;
    let query: any = {};

    const loggedInJury = req.user!;
    if (loggedInJury.year) query.year = loggedInJury.year;
    else if (year) query.year = year;

    if (loggedInJury.department) query.department = loggedInJury.department;
    else if (department) query.department = department;

    if (loggedInJury.section) query.section = loggedInJury.section;
    else if (section) query.section = section;

    if (search) query.name = { $regex: search, $options: 'i' };

    const teams = await Team.find(query).populate('members', 'name rollNumber');
    
    // Check if current jury has already scored these teams
    const juryId = req.user!._id;
    const scores = await JuryScore.find({ juryId });
    const scoredTeamIds = scores.map(s => s.teamId?.toString());

    // Fetch all agents for these teams
    const teamIds = teams.map(t => t._id);
    const agents = await Agent.find({ teamId: { $in: teamIds } });

    const teamsWithStatus = teams.map(team => {
      const hasScored = scoredTeamIds.includes(team._id.toString());
      const score = scores.find(s => s.teamId?.toString() === team._id.toString());
      const teamAgents = agents.filter(a => a.teamId?.toString() === team._id.toString());

      return {
        ...team.toObject(),
        hasScored,
        scoreGiven: hasScored ? score?.score : null,
        agents: teamAgents,
        approvedCount: teamAgents.filter(a => a.status === 'approved').length,
        pendingCount: teamAgents.filter(a => a.status === 'submitted').length,
        rejectedCount: teamAgents.filter(a => a.status === 'rejected').length
      };
    });

    res.status(200).json(teamsWithStatus);
  } catch (error) {
    next(error);
  }
};

export const getJuryTeamDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id).populate('members', 'name rollNumber department section year');
    if (!team) {
      res.status(404);
      throw new Error('Team not found');
    }

    const loggedInJury = req.user!;
    if (loggedInJury.year && team.year !== loggedInJury.year) {
      res.status(403);
      throw new Error('You are not authorized to evaluate this team (year mismatch)');
    }
    if (loggedInJury.department && team.department !== loggedInJury.department) {
      res.status(403);
      throw new Error('You are not authorized to evaluate this team (department mismatch)');
    }
    if (loggedInJury.section && team.section !== loggedInJury.section) {
      res.status(403);
      throw new Error('You are not authorized to evaluate this team (section mismatch)');
    }

    const agents = await Agent.find({ teamId: id });
    
    const juryId = req.user!._id;
    const score = await JuryScore.findOne({ juryId, teamId: id });

    res.status(200).json({
      team,
      agents,
      scoreRecord: score || null,
    });
  } catch (error) {
    next(error);
  }
};

export const submitTeamScore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId, score, remarks } = req.body;
    const user = req.user!;

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404);
      throw new Error('Team not found');
    }

    if (user.year && team.year !== user.year) {
      res.status(403);
      throw new Error('You are not authorized to score this team (year mismatch)');
    }
    if (user.department && team.department !== user.department) {
      res.status(403);
      throw new Error('You are not authorized to score this team (department mismatch)');
    }
    if (user.section && team.section !== user.section) {
      res.status(403);
      throw new Error('You are not authorized to score this team (section mismatch)');
    }

    const existingScore = await JuryScore.findOne({ juryId: user._id, teamId });
    if (existingScore) {
      res.status(400);
      throw new Error('You have already scored this team. Scores cannot be changed once submitted.');
    }

    const juryScore = await JuryScore.create({
      juryId: user._id,
      teamId,
      juryType: user.role as any,
      score,
      remarks,
    });

    io.emit('leaderboard:update');

    res.status(201).json(juryScore);
  } catch (error) {
    next(error);
  }
};

export const getMyScores = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const scores = await JuryScore.find({ juryId: user._id }).populate('teamId', 'name department');
    res.status(200).json(scores);
  } catch (error) {
    next(error);
  }
};

export const updateAgentStatusJury = async (req: Request, res: Response, next: NextFunction) => {
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
