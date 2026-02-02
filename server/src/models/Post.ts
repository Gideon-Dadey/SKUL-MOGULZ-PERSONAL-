import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IPost extends Document {
    author: mongoose.Types.ObjectId | IUser;
    content: string;
    media: string[];
    likes: mongoose.Types.ObjectId[];
    comments: {
        author: mongoose.Types.ObjectId | IUser;
        content: string;
        createdAt: Date;
    }[];
    location?: string;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    location: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IPost>('Post', postSchema);
