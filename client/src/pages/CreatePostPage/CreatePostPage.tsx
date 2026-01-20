import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, X, Sparkles, Hash, DollarSign, Target, Briefcase } from 'lucide-react';
import { PROJECT_CATEGORIES, ProjectCategory } from '../../types';
import './CreatePostPage.css';

const STAGES = [
    { value: 'idea', label: 'Idea', description: 'Just started', icon: <Sparkles size={18} /> },
    { value: 'prototype', label: 'Prototype', description: 'In progress', icon: <Target size={18} /> },
    { value: 'mvp', label: 'MVP', description: 'Ready to test', icon: <Briefcase size={18} /> },
    { value: 'growth', label: 'Growth', description: 'Gaining traction', icon: <DollarSign size={18} /> },
    { value: 'scaling', label: 'Scaling', description: 'Expanding', icon: <Hash size={18} /> },
];

const CreatePostPage: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<ProjectCategory | ''>('');
    const [stage, setStage] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [hasFunding, setHasFunding] = useState(false);
    const [fundingGoal, setFundingGoal] = useState('');
    const [currentFunding, setCurrentFunding] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Mock submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/feed');
    };

    const isFormValid = title.trim() && content.trim() && category && stage;

    return (
        <div className="create-layout">
            <div className="create-container">
                <header className="create-header">
                    <button className="create-back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1>Create a Post</h1>
                    <button
                        className="btn btn-primary btn--md"
                        onClick={handleSubmit}
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </header>

                <div className="create-main">
                    <div className="create-content-area">
                        <input
                            type="text"
                            className="create-title-input"
                            placeholder="What are you working on?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            className="create-body-input"
                            placeholder="Share your progress, ask for feedback, or find collaborators..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />

                        <div className="create-tags-area">
                            {tags.map(tag => (
                                <span key={tag} className="create-tag">
                                    #{tag}
                                    <button onClick={() => handleRemoveTag(tag)}><X size={12} /></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                className="create-tag-input"
                                placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                            />
                        </div>

                        <div className="create-toolbar">
                            <button className="toolbar-btn"><Image size={20} /></button>
                            <button className="toolbar-btn"><Sparkles size={20} /></button>
                        </div>
                    </div>

                    <aside className="create-settings">
                        <section className="settings-group">
                            <h3>Category</h3>
                            <div className="settings-pills">
                                {PROJECT_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.value}
                                        className={`settings-pill ${category === cat.value ? 'active' : ''}`}
                                        onClick={() => setCategory(cat.value)}
                                        title={cat.label}
                                    >
                                        <span className="pill-icon">{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="settings-group">
                            <h3>Project Stage</h3>
                            <div className="settings-list">
                                {STAGES.map(s => (
                                    <button
                                        key={s.value}
                                        className={`settings-list-item ${stage === s.value ? 'active' : ''}`}
                                        onClick={() => setStage(s.value)}
                                    >
                                        <div className="list-item-icon">{s.icon}</div>
                                        <div className="list-item-text">
                                            <span className="list-item-label">{s.label}</span>
                                            <span className="list-item-desc">{s.description}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="settings-group">
                            <div className="settings-toggle-row">
                                <h3>Seeking Funding</h3>
                                <button
                                    className={`toggle-btn ${hasFunding ? 'active' : ''}`}
                                    onClick={() => setHasFunding(!hasFunding)}
                                >
                                    <div className="toggle-thumb"></div>
                                </button>
                            </div>

                            {hasFunding && (
                                <div className="funding-inputs">
                                    <div className="input-with-label">
                                        <label>Goal ($)</label>
                                        <input
                                            type="number"
                                            value={fundingGoal}
                                            onChange={(e) => setFundingGoal(e.target.value)}
                                            placeholder="10000"
                                        />
                                    </div>
                                    <div className="input-with-label">
                                        <label>Raised ($)</label>
                                        <input
                                            type="number"
                                            value={currentFunding}
                                            onChange={(e) => setCurrentFunding(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            )}
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
