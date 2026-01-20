import { Response } from 'express';
import Project from '../models/Project';
import User from '../models/User';

// @desc    Get user analytics
// @route   GET /api/analytics
export const getAnalytics = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Get all projects by this user
        const projects = await Project.find({ author: userId });

        const totalProjects = projects.length;
        const totalLikes = projects.reduce((acc, p) => acc + p.likes.length, 0);
        const totalComments = projects.reduce((acc, p) => acc + p.comments.length, 0);
        const totalViews = projects.reduce((acc, p) => acc + (p.views || 0), 0);

        // Calculate project performance (e.g. growth over time - mock for now but structured)
        const weeklyViews = [120, 450, 320, 600, 850, 430, 920];
        const weeklyConnections = [2, 5, 3, 8, 10, 4, 7];

        res.status(200).json({
            summary: {
                totalProjects,
                totalLikes,
                totalComments,
                totalViews,
                profileViews: user.viewedProfile || 0,
                searchAppearances: user.impressions || 0,
            },
            graphs: {
                views: weeklyViews,
                connections: weeklyConnections,
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            topProjects: projects
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 3)
                .map(p => ({
                    id: p._id,
                    title: p.title,
                    views: p.views || 0,
                    likes: p.likes.length
                }))
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
