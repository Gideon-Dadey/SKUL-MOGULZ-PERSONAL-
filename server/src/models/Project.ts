import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    title: string;
    description: string;
    category: string;
    studentId: string;
    images: string[];
    likes: string[]; // User IDs
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Software', 'Hardware', 'Hardware & Software', 'Social Enterprise', 'Other']
    },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true,
});

export default mongoose.model<IProject>('Project', ProjectSchema);
