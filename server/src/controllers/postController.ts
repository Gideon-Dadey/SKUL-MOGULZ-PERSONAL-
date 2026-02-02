import { Request, Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';

// @desc    Create a post
export const createPost = async (req: any, res: Response) => {
    try {
        const { content, location } = req.body;
        const media: string[] = [];
        if (req.files && Array.isArray(req.files)) {
            (req.files as any[]).forEach(file => {
                const filePath = file.path.replace(/\\/g, '/');
                media.push(`/${filePath}`);
            });
        }

        const post = await Post.create({
            author: req.user.id,
            content,
            location,
            media
        });

        // Small reward for social engagement
        await User.findByIdAndUpdate(req.user.id, { $inc: { karma: 2 } });

        res.status(201).json(post);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all posts
export const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find()
            .populate('author', 'firstName lastName avatar username')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like/Unlike a post
export const likePost = async (req: any, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const index = post.likes.indexOf(req.user.id);
        if (index > -1) {
            post.likes.splice(index, 1);
        } else {
            post.likes.push(req.user.id);
        }

        await post.save();
        res.status(200).json(post.likes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
