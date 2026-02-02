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
    banner?: string;
    bio?: string;
    headline?: string;
    location?: string;
    experience: {
        _id: string;
        title: string;
        company: string;
        location?: string;
        startDate: string;
        endDate?: string;
        current: boolean;
        description?: string;
    }[];
    education: {
        _id: string;
        school: string;
        degree: string;
        fieldOfStudy: string;
        startDate: string;
        endDate?: string;
        grade?: string;
        activities?: string;
        description?: string;
    }[];
    skills: string[];
    connections: mongoose.Types.ObjectId[];
    viewedProfile?: number;
    impressions?: number;
    bookmarks: mongoose.Types.ObjectId[];
    mutedUsers: mongoose.Types.ObjectId[];
    blockedUsers: mongoose.Types.ObjectId[];
    twoFactorEnabled: boolean;
    sessions: {
        id: string;
        device: string;
        location: string;
        ip: string;
        lastActive: Date;
    }[];
    settings: {
        loadMedia: boolean;
        autoplayVideos: boolean;
        autoplayGifs: boolean;
        showReposts: boolean;
        showReplies: boolean;
        allowDMs: boolean;
        uploadLargeMedia: boolean;
        discoverableByEmail: boolean;
        discoverableByPhone: boolean;
    };
    points: number;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const experienceSchema = new Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    startDate: { type: String, required: true },
    endDate: { type: String },
    current: { type: Boolean, default: false },
    description: { type: String }
});

const educationSchema = new Schema({
    school: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    grade: { type: String },
    activities: { type: String },
    description: { type: String }
});

const sessionSchema = new Schema({
    id: { type: String, required: true },
    device: { type: String, required: true },
    location: { type: String, default: 'Unknown' },
    ip: { type: String, required: true },
    lastActive: { type: Date, default: Date.now }
});

const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'investor', 'admin'], default: 'student' },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    banner: { type: String },
    bio: { type: String, maxlength: 500 },
    headline: { type: String, maxlength: 100 },
    location: { type: String },
    skills: [{ type: String }],
    experience: [experienceSchema],
    education: [educationSchema],
    connections: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    viewedProfile: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    mutedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    twoFactorEnabled: { type: Boolean, default: false },
    sessions: [sessionSchema],
    settings: {
        loadMedia: { type: Boolean, default: true },
        autoplayVideos: { type: Boolean, default: true },
        autoplayGifs: { type: Boolean, default: true },
        showReposts: { type: Boolean, default: true },
        showReplies: { type: Boolean, default: true },
        allowDMs: { type: Boolean, default: true },
        uploadLargeMedia: { type: Boolean, default: true },
        discoverableByEmail: { type: Boolean, default: true },
        discoverableByPhone: { type: Boolean, default: true },
    },
    points: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
