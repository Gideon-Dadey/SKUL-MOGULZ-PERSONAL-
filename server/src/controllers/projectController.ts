import { Request, Response } from 'express';
import Project from '../models/Project';

export const getProjects = async (req: Request, res: Response) => {
    try {
        const { category, search } = req.query;
        let query: any = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const projects = await Project.find(query).sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', data: projects });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json({ status: 'success', data: project });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};
