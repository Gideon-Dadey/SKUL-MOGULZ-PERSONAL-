import { Request, Response } from 'express';
import Project from '../models/Project';
import Notification from '../models/Notification';
import User from '../models/User';
import { getIO } from '../socket';
import { IUser } from '../models/User';

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

        // Increment author impressions (Organic growth)
        if (projects.length > 0) {
            const authorIds = [...new Set(projects.map(p => p.author?._id || (p.author as any).id).filter(id => !!id))];
            await User.updateMany({ _id: { $in: authorIds } }, { $inc: { impressions: 1 } });
        }

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
            .populate('author', 'firstName lastName avatar headline role location impressions')
            .populate('comments.author', 'firstName lastName avatar');

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        // Increment project views
        project.views = (project.views || 0) + 1;
        await project.save();

        // Increment author impressions
        if (project.author) {
            const authorId = (project.author as any)._id || project.author;
            await User.findByIdAndUpdate(authorId, { $inc: { impressions: 1 } });
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
            likes: [],
            replies: [],
            createdAt: new Date()
        };

        project.comments.unshift(newComment as any);
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

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req: any, res: Response) => {
    try {
        const { title, content, category, tags, projectStage, fundingGoal } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        // Check ownership
        if (project.author.toString() !== req.user.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        // Handle media updates if needed (simplified for now)
        // This assumes new media replaces old, or we just keep old if no new media
        // Ideally we'd have logic to append or remove specific images, but simple update is fine.
        let media = project.media;
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const newMedia: string[] = [];
            req.files.forEach((file: any) => {
                const filePath = file.path.replace(/\\/g, '/');
                newMedia.push(`/${filePath}`);
            });
            media = newMedia;
        }


        project.title = title || project.title;
        project.content = content || project.content;
        project.category = category || project.category;
        project.tags = tags || project.tags;
        project.projectStage = projectStage || project.projectStage;
        project.fundingGoal = fundingGoal || project.fundingGoal;
        project.media = media;

        const updatedProject = await project.save();
        await updatedProject.populate('author', 'firstName lastName avatar headline role');

        res.status(200).json(updatedProject);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req: any, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        // Check ownership
        if (project.author.toString() !== req.user.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        await project.deleteOne();

        res.status(200).json({ message: 'Project removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Like a comment
// @route   PUT /api/projects/:id/comment/:commentId/like
// @access  Private
export const likeComment = async (req: any, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        const comment = (project.comments as any).id(req.params.commentId);
        if (!comment) {
            // Check in replies if needed, but for now just top-level
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        const likeIndex = comment.likes.indexOf(req.user.id);
        if (likeIndex !== -1) {
            comment.likes.splice(likeIndex, 1);
        } else {
            comment.likes.push(req.user.id);
        }

        await project.save();
        res.status(200).json(comment.likes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reply to a comment
// @route   POST /api/projects/:id/comment/:commentId/reply
// @access  Private
export const replyComment = async (req: any, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        const comment = (project.comments as any).id(req.params.commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        const newReply = {
            content: req.body.content,
            author: req.user.id,
            createdAt: new Date(),
            likes: [],
            replies: []
        };

        comment.replies.push(newReply as any);
        await project.save();

        await project.populate([
            { path: 'comments.author', select: 'firstName lastName avatar' },
            { path: 'comments.replies.author', select: 'firstName lastName avatar' }
        ]);

        res.status(200).json(project.comments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
