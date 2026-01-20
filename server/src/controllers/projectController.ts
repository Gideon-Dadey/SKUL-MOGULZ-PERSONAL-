import { Request, Response } from 'express';
import Project from '../models/Project';
import Notification from '../models/Notification';
import { getIO } from '../socket';

// @desc    Get all projects/posts (Feed)
// @route   GET /api/projects
// @access  Public (or Private)
export const getProjects = async (req: Request, res: Response) => {
    try {
        const { category, search, stage, author } = req.query;
        let query: any = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (author) {
            query.author = author;
        }

        if (stage && stage !== 'all') {
            query.projectStage = stage;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search as string, 'i')] } }
            ];
        }

        const projects = await Project.find(query)
            .populate('author', 'firstName lastName avatar headline role')
            .sort({ createdAt: -1 });

        res.status(200).json(projects);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('author', 'firstName lastName avatar headline role location')
            .populate('comments.author', 'firstName lastName avatar');

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        res.status(200).json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a project post
// @route   POST /api/projects
// @access  Private
export const createProject = async (req: any, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const media: string[] = [];
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach((file: any) => {
                const filePath = file.path.replace(/\\/g, '/');
                media.push(`/${filePath}`);
            });
        }

        const project = await Project.create({
            ...req.body,
            media,
            author: req.user.id
        });

        // Populate author before returning
        await project.populate('author', 'firstName lastName avatar headline role');

        res.status(201).json(project);
    } catch (error: any) {
        console.error("Create Project Error:", error);
        res.status(400).json({ message: error.message || "Failed to create project" });
    }
};

// @desc    Like a project
// @route   PUT /api/projects/:id/like
// @access  Private
export const likeProject = async (req: any, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        // Check if project has already been liked
        const likeIndex = project.likes.indexOf(req.user.id);

        if (likeIndex !== -1) {
            // Unlike
            project.likes.splice(likeIndex, 1);
        } else {
            // Like
            project.likes.push(req.user.id);

            // Create Notification
            if (project.author.toString() !== req.user.id) {
                const notification = await Notification.create({
                    recipient: project.author,
                    sender: req.user.id,
                    type: 'like',
                    project: project._id,
                });

                const fullNotification = await notification.populate('sender', 'firstName lastName avatar');
                getIO().to(project.author.toString()).emit('notification', fullNotification);
            }
        }

        await project.save();
        res.status(200).json(project.likes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Comment on a project
// @route   POST /api/projects/:id/comment
// @access  Private
export const commentProject = async (req: any, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        const newComment = {
            content: req.body.content,
            author: req.user.id,
            createdAt: new Date()
        };

        project.comments.unshift(newComment);
        await project.save();

        // Create Notification
        if (project.author.toString() !== req.user.id) {
            const notification = await Notification.create({
                recipient: project.author,
                sender: req.user.id,
                type: 'comment',
                project: project._id,
                content: req.body.content.substring(0, 50) + (req.body.content.length > 50 ? '...' : '')
            });

            const fullNotification = await notification.populate('sender', 'firstName lastName avatar');
            getIO().to(project.author.toString()).emit('notification', fullNotification);
        }

        // we generally need to return the new comments list populated
        await project.populate('comments.author', 'firstName lastName avatar');

        res.status(200).json(project.comments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Support/Fund a project
// @route   POST /api/projects/:id/support
// @access  Private
export const supportProject = async (req: any, res: Response) => {
    try {
        const { amount } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        const donation = Number(amount);
        if (isNaN(donation) || donation <= 0) {
            res.status(400).json({ message: 'Invalid support amount' });
            return;
        }

        project.currentFunding! += donation;
        await project.save();

        // Create Notification
        if (project.author.toString() !== req.user.id) {
            const notification = await Notification.create({
                recipient: project.author,
                sender: req.user.id,
                type: 'funding', // using funding type
                project: project._id,
                content: `supported your project with $${donation.toLocaleString()}`
            });

            const fullNotification = await notification.populate('sender', 'firstName lastName avatar');
            getIO().to(project.author.toString()).emit('notification', fullNotification);
        }

        res.status(200).json({ currentFunding: project.currentFunding });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
