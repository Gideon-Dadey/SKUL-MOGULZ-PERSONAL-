import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    username?: string;
    email: string;
    password?: string;
    role: 'student' | 'investor' | 'admin';
    googleId?: string;
    avatar?: string;
    bio?: string;
    headline?: string;
    location?: string;
    skills: string[];
    connections: mongoose.Types.ObjectId[];
    viewedProfile?: number;
    impressions?: number;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'investor', 'admin'], default: 'student' },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    headline: { type: String, maxlength: 100 },
    location: { type: String },
    skills: [{ type: String }],
    connections: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    viewedProfile: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
