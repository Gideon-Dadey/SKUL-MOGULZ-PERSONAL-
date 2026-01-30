import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, username, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Create user
        // Generate a username from email if not provided
        const finalUsername = username || email.split('@')[0];

        // Ensure username is unique (simple check, in prod might need more robustness)
        const usernameExists = await User.findOne({ username: finalUsername });
        if (usernameExists) {
            // Append random number if username taken
            // For MVP, we'll simpler logic or let it fail if user provided it
            if (username) {
                res.status(400).json({ message: 'Username already taken' });
                return;
            }
            // Otherwise we could append random, but let's assume email prefix is unique enough for now or user will retry
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            username: finalUsername,
            password, // Mongoose middleware will hash this
            role: role || 'student',
        });

        if (user) {
            // Generate token
            const token = generateToken((user._id as mongoose.Types.ObjectId).toString());

            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                interests: user.skills || [],
                connectionsCount: user.connections?.length || 0,
                token,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        console.error("Register Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user by email OR username
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: email }
            ]
        }).select('+password');

        if (user && (await user.comparePassword(password))) {
            const token = generateToken((user._id as mongoose.Types.ObjectId).toString());

            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                interests: user.skills || [],
                connectionsCount: user.connections?.length || 0,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
    try {
        // req.user is set by authMiddleware
        const user = await User.findById((req as any).user._id);

        if (user) {
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                headline: user.headline,
                bio: user.bio,
                location: user.location,
                connectionsCount: user.connections?.length || 0,
                avatar: user.avatar,
                banner: user.banner,
                interests: user.skills || []
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        console.error("GetMe Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get user by username
// @route   GET /api/auth/profile/:username
// @access  Public
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (user) {
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                headline: user.headline,
                bio: user.bio,
                location: user.location,
                avatar: user.avatar,
                banner: user.banner,
                interests: user.skills || [],
                connectionsCount: user.connections.length
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        console.error("GetProfile Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.bio = req.body.bio || user.bio;
            user.headline = req.body.headline || user.headline;
            user.location = req.body.location || user.location;
            user.skills = req.body.interests || req.body.skills || user.skills;
            // Handle file uploads
            const files = (req as any).files;
            if (files) {
                if (files.avatar && files.avatar[0]) {
                    const filePath = files.avatar[0].path.replace(/\\/g, '/');
                    user.avatar = `/${filePath}`;
                }
                if (files.banner && files.banner[0]) {
                    const filePath = files.banner[0].path.replace(/\\/g, '/');
                    user.banner = `/${filePath}`;
                }
            } else if (req.file) {
                // Fallback for single file upload if route somehow reverted or testing
                const filePath = req.file.path.replace(/\\/g, '/');
                user.avatar = `/${filePath}`;
            }

            if (req.body.avatar) user.avatar = req.body.avatar;
            // if (req.body.banner) user.banner = req.body.banner; // Optional if we want updating via URL string

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                headline: updatedUser.headline,
                bio: updatedUser.bio,
                location: updatedUser.location,
                avatar: updatedUser.avatar,
                banner: updatedUser.banner,
                interests: updatedUser.skills || [],
                connectionsCount: updatedUser.connections?.length || 0
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        console.error("UpdateProfile Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

