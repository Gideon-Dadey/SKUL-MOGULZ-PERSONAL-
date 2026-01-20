import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

export interface IProject extends Document {
    author: mongoose.Types.ObjectId;
    title: string;
    content: string;
    category: string;
    projectStage: 'idea' | 'prototype' | 'mvp' | 'growth' | 'scaling';
    fundingGoal?: number;
    currentFunding?: number;
    tags: string[];
    images: string[];
    likes: mongoose.Types.ObjectId[];
    comments: IComment[];
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Technology', 'Healthcare', 'Education', 'Finance', 'Sustainability', 'Other']
    },
    projectStage: {
        type: String,
        required: true,
        enum: ['idea', 'prototype', 'mvp', 'growth', 'scaling'],
        default: 'idea'
    },
    fundingGoal: { type: Number },
    currentFunding: { type: Number, default: 0 },
    tags: [{ type: String }],
    images: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<IProject>('Project', ProjectSchema);
