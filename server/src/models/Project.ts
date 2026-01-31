import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IComment {
    _id?: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId | IUser;
    content: string;
    likes: mongoose.Types.ObjectId[];
    replies: IComment[];
    createdAt: Date;
}

export interface IProject extends Document {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId | IUser;
    category: string;
    tags: string[];
    media: string[]; // URLs specifically, in MVP maybe just strings

    // Project Specifics
    projectStage: 'idea' | 'prototype' | 'mvp' | 'growth' | 'scaling';
    fundingGoal?: number;
    currentFunding?: number;

    // Social
    likes: mongoose.Types.ObjectId[];
    reposts: mongoose.Types.ObjectId[];
    repostOf?: mongoose.Types.ObjectId | IProject;
    comments: IComment[];
    views: number;

    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

commentSchema.add({
    replies: [commentSchema]
});

const projectSchema = new Schema<IProject>({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true }, // Markdown or text
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
        type: String,
        required: true,
        enum: [
            'technology',
            'healthcare',
            'fintech',
            'education',
            'sustainability',
            'entertainment',
            'ecommerce',
            'social-impact',
            'ai-ml',
            'other'
        ]
    },
    tags: [{ type: String }],
    media: [{ type: String }],

    projectStage: {
        type: String,
        required: true,
        enum: ['idea', 'prototype', 'mvp', 'growth', 'scaling'],
        default: 'idea'
    },
    fundingGoal: { type: Number },
    currentFunding: { type: Number, default: 0 },

    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reposts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    repostOf: { type: Schema.Types.ObjectId, ref: 'Project' },
    comments: [commentSchema],
    views: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<IProject>('Project', projectSchema);
