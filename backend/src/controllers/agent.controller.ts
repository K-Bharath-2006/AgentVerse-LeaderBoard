import { Request, Response, NextFunction } from 'express';
import { Agent } from '../models/Agent.model';
import { Team } from '../models/Team.model';
import { Event } from '../models/Event.model';
import { io } from '../server';

export const submitAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    if (!user.teamId) {
      res.status(400);
      throw new Error('You must be in a team to submit an agent');
    }

    const event = await Event.findOne();
    if (!event?.isStarted) {
      res.status(400);
      throw new Error('Event has not started yet. You cannot submit agents.');
    }

    if (new Date() > new Date(event.endDate)) {
      res.status(400);
      throw new Error('Submissions are closed. The event has already ended.');
    }

    const team = await Team.findById(user.teamId);
    if (!team) {
      res.status(404);
      throw new Error('Team not found');
    }

    const {
      agentName, theme, facultyMentor, llmUsed, framework,
      techStack, githubUrl, liveDemoUrl, videoDemoUrl,
      documentationUrl, shortDescription
    } = req.body;

    const agent = await Agent.create({
      teamId: team._id,
      teamName: team.name,
      submittedBy: user._id,
      agentName,
      theme,
      facultyMentor,
      llmUsed,
      framework,
      techStack,
      githubUrl,
      liveDemoUrl,
      videoDemoUrl,
      documentationUrl,
      shortDescription,
    });

    // Notify clients about new submission
    io.emit('activity:new', {
      department: team.department,
      teamName: team.name,
      agentName: agent.agentName,
      type: 'submitted',
      timestamp: new Date(),
    });
    
    // Also broadcast dashboard stats update
    io.emit('dashboard:update');

    res.status(201).json(agent);
  } catch (error) {
    next(error);
  }
};

export const getMyAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    if (!user.teamId) {
      return res.status(200).json([]);
    }

    const agents = await Agent.find({ teamId: user.teamId }).populate('submittedBy', 'name');
    res.status(200).json(agents);
  } catch (error) {
    next(error);
  }
};

export const getAllAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = await Agent.find().populate('teamId', 'name department');
    res.status(200).json(agents);
  } catch (error) {
    next(error);
  }
};

export const updateAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!user.teamId) {
      res.status(400);
      throw new Error('You must be in a team to edit an agent');
    }

    const event = await Event.findOne();
    if (!event?.isStarted || new Date() > new Date(event.endDate)) {
      res.status(400);
      throw new Error('Submissions are closed. Either the event has not started or it has already ended.');
    }

    const agent = await Agent.findById(id);
    if (!agent) {
      res.status(404);
      throw new Error('Agent not found');
    }

    if (agent.teamId.toString() !== user.teamId.toString()) {
      res.status(403);
      throw new Error('You can only edit agents submitted by your team');
    }

    if (agent.status === 'approved') {
      res.status(400);
      throw new Error('Approved agents cannot be modified');
    }

    const {
      agentName, theme, facultyMentor, llmUsed, framework,
      techStack, githubUrl, liveDemoUrl, videoDemoUrl,
      documentationUrl, shortDescription
    } = req.body;

    agent.agentName = agentName;
    agent.theme = theme;
    agent.facultyMentor = facultyMentor;
    agent.llmUsed = llmUsed;
    agent.framework = framework;
    agent.techStack = techStack;
    agent.githubUrl = githubUrl;
    agent.liveDemoUrl = liveDemoUrl;
    agent.videoDemoUrl = videoDemoUrl;
    agent.documentationUrl = documentationUrl;
    agent.shortDescription = shortDescription;
    agent.status = 'submitted'; // Reset status when edited for re-evaluation

    await agent.save();

    io.emit('dashboard:update');

    res.status(200).json(agent);
  } catch (error) {
    next(error);
  }
};

export const deleteAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!user.teamId) {
      res.status(400);
      throw new Error('You must be in a team to delete an agent');
    }

    const event = await Event.findOne();
    if (!event?.isStarted || new Date() > new Date(event.endDate)) {
      res.status(400);
      throw new Error('Submissions are closed. Either the event has not started or it has already ended.');
    }

    const agent = await Agent.findById(id);
    if (!agent) {
      res.status(404);
      throw new Error('Agent not found');
    }

    if (agent.teamId.toString() !== user.teamId.toString()) {
      res.status(403);
      throw new Error('You can only delete agents submitted by your team');
    }

    if (agent.status === 'approved') {
      res.status(400);
      throw new Error('Approved agents cannot be deleted');
    }

    await Agent.findByIdAndDelete(id);

    io.emit('dashboard:update');

    res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    next(error);
  }
};

