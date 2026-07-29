import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Team } from '../models/Team.model';
import { User } from '../models/User.model';

export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const user = req.user!;

    const existingUserTeam = await Team.findOne({ members: user._id });
    if (existingUserTeam) {
      if (String(user.teamId) !== String(existingUserTeam._id)) {
        user.teamId = existingUserTeam._id as any;
        await user.save();
      }
      res.status(400);
      throw new Error('You are already in a team');
    }

    if (user.teamId) {
      user.teamId = undefined;
      await user.save();
    }

    const teamExists = await Team.findOne({ name });
    if (teamExists) {
      res.status(400);
      throw new Error('Team name already exists');
    }

    const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const team = await Team.create({
      name,
      leaderId: user._id,
      members: [user._id],
      department: user.department || 'Unknown',
      section: user.section,
      year: user.year,
      joinCode,
    });

    user.teamId = team._id as any;
    await user.save();

    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

export const joinTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { joinCode } = req.body;
    const user = req.user!;

    const existingUserTeam = await Team.findOne({ members: user._id });
    if (existingUserTeam) {
      if (String(user.teamId) !== String(existingUserTeam._id)) {
        user.teamId = existingUserTeam._id as any;
        await user.save();
      }
      res.status(400);
      throw new Error('You are already in a team');
    }

    if (user.teamId) {
      user.teamId = undefined;
      await user.save();
    }

    const team = await Team.findOne({ joinCode });
    if (!team) {
      res.status(404);
      throw new Error('Invalid join code');
    }

    if (team.members.length >= 3) {
      res.status(400);
      throw new Error('Team is already full (max 3 members)');
    }

    team.members.push(user._id as any);
    await team.save();

    user.teamId = team._id as any;
    await user.save();

    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
};

export const getMyTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const team = await Team.findOne({ members: user._id }).populate('members', 'name email rollNumber department section year');
    
    if (!team) {
      res.status(404);
      throw new Error('You are not in a team');
    }

    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
};

export const getAllTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await Team.find().populate('members', 'name rollNumber');
    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};
