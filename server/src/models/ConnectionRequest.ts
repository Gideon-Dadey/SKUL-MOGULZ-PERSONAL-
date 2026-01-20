import mongoose, { Document, Schema } from 'mongoose';

export interface IConnectionRequest extends Document {
    sender: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
}

const connectionRequestSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Ensure a user can only send one request to another user
connectionRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

export default mongoose.model<IConnectionRequest>('ConnectionRequest', connectionRequestSchema);
