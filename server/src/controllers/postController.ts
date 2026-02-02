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
            .sort({ createdAt: -1 })
            .lean();

        const formattedPosts = posts.map(post => ({
            ...post,
            id: post._id.toString(),
            type: 'post'
        }));

        res.status(200).json(formattedPosts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single post
export const getPostById = async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'firstName lastName username avatar headline role location')
            .lean();

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        res.status(200).json({
            ...post,
            id: (post as any)._id.toString(),
            type: 'post'
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a post
export const updatePost = async (req: any, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        if (post.author.toString() !== req.user.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('author', 'firstName lastName username avatar headline role location');

        res.status(200).json(updatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a post
export const deletePost = async (req: any, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        if (post.author.toString() !== req.user.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        await post.deleteOne();
        res.status(200).json({ message: 'Post removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Comment on a post
export const commentPost = async (req: any, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const newComment = {
            content: req.body.content,
            author: req.user.id,
            createdAt: new Date()
        };

        (post.comments as any).unshift(newComment);
        await post.save();

        await post.populate('comments.author', 'firstName lastName username avatar');

        res.status(200).json(post.comments);
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
// @desc    Bookmark a post
export const toggleBookmark = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const bookmarkIndex = user.bookmarks.indexOf(post._id as any);

        if (bookmarkIndex !== -1) {
            user.bookmarks.splice(bookmarkIndex, 1);
        } else {
            user.bookmarks.push(post._id as any);
        }

        await user.save();
        res.status(200).json(user.bookmarks);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
