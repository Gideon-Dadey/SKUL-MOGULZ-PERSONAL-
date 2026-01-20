"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Generate JWT Token
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, username, password, role } = req.body;
        // Check if user exists
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // Create user
        // Generate a username from email if not provided
        const finalUsername = username || email.split('@')[0];
        // Ensure username is unique (simple check, in prod might need more robustness)
        const usernameExists = await User_1.default.findOne({ username: finalUsername });
        if (usernameExists) {
            // Append random number if username taken
            // For MVP, we'll simpler logic or let it fail if user provided it
            if (username) {
                res.status(400).json({ message: 'Username already taken' });
                return;
            }
            // Otherwise we could append random, but let's assume email prefix is unique enough for now or user will retry
        }
        const user = await User_1.default.create({
            firstName,
            lastName,
            email,
            username: finalUsername,
            password, // Mongoose middleware will hash this
            role: role || 'student',
        });
        if (user) {
            // Generate token
            const token = generateToken(user._id.toString());
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                token,
            });
        }
        else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    }
    catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.register = register;
// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email }).select('+password');
        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id.toString());
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                token,
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.login = login;
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        // req.user is set by authMiddleware
        const user = await User_1.default.findById(req.user._id);
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
                avatar: user.avatar
            });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        console.error("GetMe Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.getMe = getMe;
