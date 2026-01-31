
export interface Experience {
    id?: string;
    _id?: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
}

export interface Education {
    id?: string;
    _id?: string;
    school: string;
    degree: string;
    field?: string;
    fieldOfStudy?: string;
    startYear: string;
    endYear?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export interface User {
    id: string;
    _id?: string;
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
    skills?: string[];
    experience?: Experience[];
    education?: Education[];
    connections?: string[];
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
    _id?: string;
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
    _id?: string;
    author: User;
    content: string;
    likes: string[];
    replies: Comment[];
    createdAt: string;
}

export interface Notification {
    _id: string;
    id?: string;
    sender: User;
    type: 'like' | 'comment' | 'follow' | 'funding' | 'new_post';
    message?: string;
    isRead: boolean;
    project?: {
        _id: string;
        title: string;
    };
    content?: string;
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}
