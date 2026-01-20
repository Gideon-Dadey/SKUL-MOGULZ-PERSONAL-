import { Post, User, Notification } from '../types';

// Mock Users
export const mockUsers: User[] = [
    {
        id: '1',
        email: 'alex@stanford.edu',
        firstName: 'Alex',
        lastName: 'Johnson',
        username: 'alexj',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        bio: 'Building the future of education technology. Stanford CS student.',
        role: 'student',
        interests: ['technology', 'education', 'ai-ml'],
        createdAt: '2025-09-15T10:00:00Z',
    },
    {
        id: '2',
        email: 'maya@mit.edu',
        firstName: 'Maya',
        lastName: 'Patel',
        username: 'mayap',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        bio: 'Healthcare innovator | MIT Bioengineering | Passionate about accessible medicine',
        role: 'student',
        interests: ['healthcare', 'ai-ml', 'social-impact'],
        createdAt: '2025-08-20T14:30:00Z',
    },
    {
        id: '3',
        email: 'david@berkeley.edu',
        firstName: 'David',
        lastName: 'Chen',
        username: 'davidc',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        bio: 'FinTech enthusiast | UC Berkeley MBA | Building financial literacy tools',
        role: 'student',
        interests: ['fintech', 'education', 'technology'],
        createdAt: '2025-07-10T09:15:00Z',
    },
    {
        id: '4',
        email: 'sarah@investor.com',
        firstName: 'Sarah',
        lastName: 'Williams',
        username: 'sarahw',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop',
        bio: 'Angel Investor | Ex-Google | Focused on EdTech & HealthTech startups',
        role: 'investor',
        interests: ['education', 'healthcare', 'ai-ml'],
        createdAt: '2025-06-01T11:00:00Z',
    },
];

// Mock Posts
export const mockPosts: Post[] = [
    {
        id: '1',
        author: mockUsers[0],
        title: 'Introducing LearnAI: Personalized Learning Powered by AI',
        content: `I'm excited to share my latest project - LearnAI! 🚀

After months of research and development, we've built an AI-powered learning platform that adapts to each student's unique learning style.

**Key Features:**
- Adaptive learning paths based on performance
- Real-time feedback and explanations
- Progress tracking for parents and teachers
- Gamification elements to keep students engaged

We're currently in the MVP stage and looking for beta testers and feedback from educators. Would love to connect with anyone interested in EdTech!

#EdTech #AI #Learning #Startup`,
        category: 'education',
        tags: ['AI', 'EdTech', 'Machine Learning', 'Education'],
        likes: 47,
        likedBy: ['2', '3', '4'],
        comments: [
            {
                id: 'c1',
                author: mockUsers[3],
                content: 'This looks incredibly promising! Would love to schedule a call to learn more about your roadmap.',
                likes: 8,
                createdAt: '2026-01-18T14:30:00Z',
            },
            {
                id: 'c2',
                author: mockUsers[1],
                content: 'Amazing work Alex! The adaptive learning approach is exactly what education needs.',
                likes: 5,
                createdAt: '2026-01-18T16:45:00Z',
            },
        ],
        projectStage: 'mvp',
        fundingGoal: 150000,
        currentFunding: 45000,
        createdAt: '2026-01-18T10:00:00Z',
        updatedAt: '2026-01-18T10:00:00Z',
    },
    {
        id: '2',
        author: mockUsers[1],
        title: 'MedConnect: Bridging Healthcare Gaps in Underserved Communities',
        content: `Healthcare accessibility shouldn't depend on your zip code. That's why we built MedConnect.

Our platform connects patients in underserved areas with healthcare providers through telemedicine, with a focus on:

🏥 **Affordable consultations** - Pay-what-you-can model
📱 **Mobile-first design** - Works on low-bandwidth connections
🌍 **Multi-language support** - Breaking language barriers
💊 **Prescription delivery** - Partner pharmacies for medication access

We've already helped 500+ patients in our pilot program. Looking for investors who share our vision of healthcare equity.

Progress update: Just secured our first clinic partnership! 🎉`,
        category: 'healthcare',
        tags: ['Healthcare', 'Telemedicine', 'Social Impact', 'Startup'],
        likes: 89,
        likedBy: ['1', '3', '4'],
        comments: [
            {
                id: 'c3',
                author: mockUsers[3],
                content: 'The pay-what-you-can model is brilliant. This is exactly the kind of innovation healthcare needs.',
                likes: 12,
                createdAt: '2026-01-17T09:20:00Z',
            },
        ],
        projectStage: 'growth',
        fundingGoal: 500000,
        currentFunding: 125000,
        createdAt: '2026-01-17T08:00:00Z',
        updatedAt: '2026-01-19T15:30:00Z',
    },
    {
        id: '3',
        author: mockUsers[2],
        title: 'WealthWise: Financial Literacy for Gen-Z',
        content: `Did you know that 76% of Gen-Z feels unprepared to manage their finances? We're changing that.

WealthWise is a gamified financial literacy app designed specifically for young adults:

💰 **Learn by doing** - Simulate real investments with virtual money
📊 **Personal finance tracking** - Budgeting made simple
🎮 **Compete with friends** - Leaderboards and challenges
🎓 **Bite-sized lessons** - Learn in 5 minutes a day

**Traction so far:**
- 2,500 beta users
- 4.8 star rating on TestFlight
- Featured in TechCrunch's "Startups to Watch"

Raising our seed round - DMs open!`,
        category: 'fintech',
        tags: ['FinTech', 'Financial Literacy', 'Gen-Z', 'Education'],
        likes: 156,
        likedBy: ['1', '2', '4'],
        comments: [
            {
                id: 'c4',
                author: mockUsers[0],
                content: 'Love the gamification approach! Just signed up for beta.',
                likes: 6,
                createdAt: '2026-01-16T11:00:00Z',
            },
            {
                id: 'c5',
                author: mockUsers[3],
                content: 'Very impressive traction. Sending you an email about potential investment.',
                likes: 15,
                createdAt: '2026-01-16T14:20:00Z',
            },
        ],
        projectStage: 'growth',
        fundingGoal: 750000,
        currentFunding: 280000,
        createdAt: '2026-01-16T09:00:00Z',
        updatedAt: '2026-01-16T09:00:00Z',
    },
    {
        id: '4',
        author: mockUsers[0],
        title: 'Weekly Update: LearnAI Partnership with 3 Schools!',
        content: `Big news for LearnAI! 📢

This week we officially partnered with 3 schools in the Bay Area to pilot our platform:

1. **Lincoln High School** - 500 students
2. **Washington Middle School** - 300 students  
3. **Tech Charter Academy** - 200 students

That's 1,000 students who will be using LearnAI starting next month!

**Next Steps:**
- Onboarding teachers next week
- Setting up curriculum integration
- Planning feedback collection process

Thank you to everyone who supported us on this journey. This is just the beginning! 🚀

#StartupLife #EdTech #Milestone`,
        category: 'education',
        tags: ['Update', 'EdTech', 'Partnership', 'Milestone'],
        likes: 72,
        likedBy: ['2', '3', '4'],
        comments: [],
        projectStage: 'mvp',
        createdAt: '2026-01-20T08:00:00Z',
        updatedAt: '2026-01-20T08:00:00Z',
    },
    {
        id: '5',
        author: mockUsers[1],
        title: 'Idea Stage: AI-Powered Mental Health Check-ins',
        content: `Exploring a new idea and would love community feedback! 🧠

**The Problem:**
Mental health issues often go undetected until they become severe. Students especially struggle to recognize when they need help.

**The Idea:**
An AI chatbot that performs daily 2-minute check-ins:
- Analyzes mood patterns over time
- Identifies early warning signs
- Suggests coping strategies
- Connects users with professionals when needed

**Questions for the community:**
1. Would you use something like this?
2. What privacy concerns would you have?
3. How can we make it feel less clinical?

Drop your thoughts in the comments! 💭`,
        category: 'healthcare',
        tags: ['Mental Health', 'AI', 'Idea', 'Feedback'],
        likes: 34,
        likedBy: ['1', '3'],
        comments: [
            {
                id: 'c6',
                author: mockUsers[2],
                content: 'Privacy would be my biggest concern. Would love to see end-to-end encryption and data ownership options.',
                likes: 8,
                createdAt: '2026-01-19T16:00:00Z',
            },
        ],
        projectStage: 'idea',
        createdAt: '2026-01-19T14:00:00Z',
        updatedAt: '2026-01-19T14:00:00Z',
    },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
    {
        id: 'n1',
        type: 'like',
        message: 'Sarah Williams liked your post "Introducing LearnAI"',
        read: false,
        relatedPostId: '1',
        fromUser: mockUsers[3],
        createdAt: '2026-01-20T15:30:00Z',
    },
    {
        id: 'n2',
        type: 'comment',
        message: 'Maya Patel commented on your post',
        read: false,
        relatedPostId: '1',
        fromUser: mockUsers[1],
        createdAt: '2026-01-20T14:45:00Z',
    },
    {
        id: 'n3',
        type: 'new_post',
        message: 'New post in Healthcare: "MedConnect Update"',
        read: true,
        relatedPostId: '2',
        createdAt: '2026-01-19T10:00:00Z',
    },
];
