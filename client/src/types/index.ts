
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
    experience?: Experience[];
    education?: Education[];
    bookmarks?: string[];
    createdAt: string;
}

export interface Experience {
    id: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
}

export interface Education {
    id: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    grade?: string;
    activities?: string;
    description?: string;
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
    { value: 'technology', label: 'Technology', icon: 'Cpu' },
    { value: 'healthcare', label: 'Healthcare', icon: 'Activity' },
    { value: 'fintech', label: 'FinTech', icon: 'Landmark' },
    { value: 'education', label: 'Education', icon: 'GraduationCap' },
    { value: 'sustainability', label: 'Sustainability', icon: 'Leaf' },
    { value: 'entertainment', label: 'Entertainment', icon: 'Film' },
    { value: 'ecommerce', label: 'E-Commerce', icon: 'ShoppingBag' },
    { value: 'social-impact', label: 'Social Impact', icon: 'Globe' },
    { value: 'ai-ml', label: 'AI & Machine Learning', icon: 'Bot' },
    { value: 'other', label: 'Other', icon: 'Sparkles' },
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
    media?: string[];
    likes: number;
    likedBy: string[];
    reposts?: string[];
    repostOf?: Post;
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
    _id?: string;
    type: 'like' | 'comment' | 'follow' | 'new_post' | 'repost' | 'funding';
    message: string;
    recipient: string | User;
    sender: User;
    project?: Post;
    content?: string;
    isRead: boolean;
    createdAt: string;
}


export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}
