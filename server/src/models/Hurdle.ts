import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IHurdle extends Document {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId | IUser;
    tags: string[];
    upvotes: mongoose.Types.ObjectId[];
    answers: {
        _id: mongoose.Types.ObjectId;
        author: mongoose.Types.ObjectId | IUser;
        content: string;
        isAccepted: boolean;
        upvotes: mongoose.Types.ObjectId[];
        createdAt: Date;
    }[];
    status: 'open' | 'solved';
    createdAt: Date;
    updatedAt: Date;
}

const answerSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isAccepted: { type: Boolean, default: false },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const hurdleSchema = new Schema<IHurdle>({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    answers: [answerSchema],
    status: { type: String, enum: ['open', 'solved'], default: 'open' }
}, {
    timestamps: true
});

export default mongoose.model<IHurdle>('Hurdle', hurdleSchema);
