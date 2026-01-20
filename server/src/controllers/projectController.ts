import { Request, Response } from 'express';
import Project from '../models/Project';

// @desc    Get all projects/posts (Feed)
// @route   GET /api/projects
// @access  Public (or Private)
export const getProjects = async (req: Request, res: Response) => {
    try {
        const { category, search, stage } = req.query;
        let query: any = {};

        if (category && category !== 'all') {
            query.category = category;
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

        const project = await Project.create({
            ...req.body,
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

        // we generally need to return the new comments list populated
        await project.populate('comments.author', 'firstName lastName avatar');

        res.status(200).json(project.comments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
