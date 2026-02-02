import { Request, Response } from 'express';
import Hurdle from '../models/Hurdle';
import Milestone from '../models/Milestone';
import User from '../models/User';
import Project from '../models/Project';

// --- HURDLES (Q&A) ---

// @desc    Ask a new hurdle (Q&A)
export const askHurdle = async (req: any, res: Response) => {
    try {
        const { title, content, tags } = req.body;
        const hurdle = await Hurdle.create({
            title,
            content,
            tags,
            author: req.user.id
        });

        // Add Karma/Points for being active
        await User.findByIdAndUpdate(req.user.id, { $inc: { points: 10, karma: 5 } });

        res.status(201).json(hurdle);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all hurdles
export const getHurdles = async (req: Request, res: Response) => {
    try {
        const hurdles = await Hurdle.find()
            .populate('author', 'firstName lastName avatar')
            .sort({ createdAt: -1 });
        res.status(200).json(hurdles);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Answer a hurdle
export const answerHurdle = async (req: any, res: Response) => {
    try {
        const { content } = req.body;
        const hurdle = await Hurdle.findById(req.params.id);

        if (!hurdle) {
            res.status(404).json({ message: 'Hurdle not found' });
            return;
        }

        hurdle.answers.push({
            author: req.user.id,
            content,
            isAccepted: false,
            upvotes: [],
            createdAt: new Date(),
            _id: undefined as any // mongoose will generate
        });

        await hurdle.save();

        // Reward answerer
        await User.findByIdAndUpdate(req.user.id, { $inc: { points: 25, karma: 10 } });

        res.status(200).json(hurdle);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// --- MILESTONES ---

// @desc    Log a project milestone
export const logMilestone = async (req: any, res: Response) => {
    try {
        const { projectId, title, content, type } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (project.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only author can log milestones' });
        }

        const milestone = await Milestone.create({
            project: projectId,
            author: req.user.id,
            title,
            content,
            type
        });

        res.status(201).json(milestone);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all milestones
export const getMilestones = async (req: Request, res: Response) => {
    try {
        const milestones = await Milestone.find()
            .populate('author', 'firstName lastName avatar')
            .populate('project', 'title')
            .sort({ createdAt: -1 });
        res.status(200).json(milestones);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// --- ENDORSEMENTS ---

// @desc    Endorse a skill
export const endorseSkill = async (req: any, res: Response) => {
    try {
        const { userId, skill } = req.body;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const skillIndex = user.endorsedSkills.findIndex(s => s.skill.toLowerCase() === skill.toLowerCase());

        if (skillIndex > -1) {
            if (user.endorsedSkills[skillIndex].endorsedBy.includes(req.user.id)) {
                return res.status(400).json({ message: 'Already endorsed' });
            }
            user.endorsedSkills[skillIndex].endorsedBy.push(req.user.id);
        } else {
            user.endorsedSkills.push({
                skill,
                endorsedBy: [req.user.id]
            });
        }

        await user.save();

        // Reward the skilled mogul
        await User.findByIdAndUpdate(userId, { $inc: { points: 50, karma: 20 } });

        res.status(200).json(user.endorsedSkills);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
