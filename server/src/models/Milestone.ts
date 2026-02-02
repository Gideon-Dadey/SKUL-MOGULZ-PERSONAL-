import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IProject } from './Project';

export interface IMilestone extends Document {
    project: mongoose.Types.ObjectId | IProject;
    author: mongoose.Types.ObjectId | IUser;
    title: string;
    content: string;
    media?: string[];
    likes: mongoose.Types.ObjectId[];
    type: 'breakthrough' | 'update' | 'launch' | 'milestone';
    createdAt: Date;
    updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>({
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    media: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    type: {
        type: String,
        enum: ['breakthrough', 'update', 'launch', 'milestone'],
        default: 'update'
    }
}, {
    timestamps: true
});

export default mongoose.model<IMilestone>('Milestone', milestoneSchema);
