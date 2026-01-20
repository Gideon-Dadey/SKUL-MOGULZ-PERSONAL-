import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: 'student' | 'investor' | 'admin';
    headline?: string;
    location?: string;
    avatar?: string;
    bio?: string;
    connections: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'investor', 'admin'], default: 'student' },
    headline: { type: String },
    location: { type: String },
    avatar: { type: String },
    bio: { type: String },
    connections: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model<IUser>('User', UserSchema);
