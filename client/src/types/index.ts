
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
    banner?: string;
    bio?: string;
    headline?: string;
    location?: string;
    role: 'student' | 'investor';
    interests: string[];
    connections?: string[];
    connectionsCount?: number;
    impressions?: number;
    viewedProfile?: number;
    createdAt: string;
}


export type ProjectCategory =
    | 'technology'
    | 'healthcare'
    | 'fintech'
    | 'education'
    | 'sustainability'
    | 'entertainment'
    | 'ecommerce'
    | 'social-impact'
    | 'ai-ml'
    | 'other';

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string; icon: string }[] = [
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'fintech', label: 'FinTech', icon: '💰' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'sustainability', label: 'Sustainability', icon: '🌱' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
    { value: 'social-impact', label: 'Social Impact', icon: '🤝' },
    { value: 'ai-ml', label: 'AI & Machine Learning', icon: '🤖' },
    { value: 'other', label: 'Other', icon: '✨' },
];


export interface Post {
    id: string;
    author: User;
    title: string;
    content: string;
    category: ProjectCategory;
    tags: string[];
    images?: string[];
    likes: number;
    likedBy: string[];
    comments: Comment[];
    projectStage: 'idea' | 'prototype' | 'mvp' | 'growth' | 'scaling';
    fundingGoal?: number;
    currentFunding?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string;
    author: User;
    content: string;
    likes: number;
    createdAt: string;
}


export interface Notification {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'new_post';
    message: string;
    read: boolean;
    relatedPostId?: string;
    fromUser?: User;
    createdAt: string;
}


export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}
