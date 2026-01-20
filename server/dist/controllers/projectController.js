"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentProject = exports.likeProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const Project_1 = __importDefault(require("../models/Project"));
// @desc    Get all projects/posts (Feed)
// @route   GET /api/projects
// @access  Public (or Private)
const getProjects = async (req, res) => {
    try {
        const { category, search, stage } = req.query;
        let query = {};
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
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        const projects = await Project_1.default.find(query)
            .populate('author', 'firstName lastName avatar headline role')
            .sort({ createdAt: -1 });
        res.status(200).json(projects);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProjects = getProjects;
// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
    try {
        const project = await Project_1.default.findById(req.params.id)
            .populate('author', 'firstName lastName avatar headline role location')
            .populate('comments.author', 'firstName lastName avatar');
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }
        res.status(200).json(project);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProjectById = getProjectById;
// @desc    Create a project post
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const project = await Project_1.default.create({
            ...req.body,
            author: req.user.id
        });
        // Populate author before returning
        await project.populate('author', 'firstName lastName avatar headline role');
        res.status(201).json(project);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createProject = createProject;
// @desc    Like a project
// @route   PUT /api/projects/:id/like
// @access  Private
const likeProject = async (req, res) => {
    try {
        const project = await Project_1.default.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }
        // Check if project has already been liked
        const likeIndex = project.likes.indexOf(req.user.id);
        if (likeIndex !== -1) {
            // Unlike
            project.likes.splice(likeIndex, 1);
        }
        else {
            // Like
            project.likes.push(req.user.id);
        }
        await project.save();
        res.status(200).json(project.likes);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.likeProject = likeProject;
// @desc    Comment on a project
// @route   POST /api/projects/:id/comment
// @access  Private
const commentProject = async (req, res) => {
    try {
        const project = await Project_1.default.findById(req.params.id);
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.commentProject = commentProject;
