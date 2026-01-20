import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'student' | 'investor' | 'admin';
    bio?: string;
    profileImage?: string;
    following: string[]; // Project IDs or User IDs
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'investor', 'admin'], default: 'student' },
    bio: { type: String },
    profileImage: { type: String },
    following: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
}, {
    timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);
