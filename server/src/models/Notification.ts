import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    type: 'like' | 'comment' | 'follow' | 'funding' | 'system';
    project?: mongoose.Types.ObjectId;
    content?: string;
    isRead: boolean;
    createdAt: Date;
}

const notificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'funding', 'system'],
        required: true
    },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    content: { type: String },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<INotification>('Notification', notificationSchema);
