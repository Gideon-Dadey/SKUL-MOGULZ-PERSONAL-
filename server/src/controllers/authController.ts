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
        const userExists = await User.findOne({ email });
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
                connections: user.connections,
                avatar: user.avatar,
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
