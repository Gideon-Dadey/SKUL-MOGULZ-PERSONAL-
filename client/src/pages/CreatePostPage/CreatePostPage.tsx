import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, X, Sparkles } from 'lucide-react';
import { PROJECT_CATEGORIES, ProjectCategory } from '../../types';
import './CreatePostPage.css';

const STAGES = [
    { value: 'idea', label: 'Idea', description: 'Just an idea, looking for feedback' },
    { value: 'prototype', label: 'Prototype', description: 'Working on a prototype' },
    { value: 'mvp', label: 'MVP', description: 'Minimum viable product ready' },
    { value: 'growth', label: 'Growth', description: 'Product launched, growing users' },
    { value: 'scaling', label: 'Scaling', description: 'Scaling operations' },
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

        // Mock submission - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log({
            title,
            content,
            category,
            stage,
            tags,
            fundingGoal: hasFunding ? parseInt(fundingGoal) : undefined,
            currentFunding: hasFunding ? parseInt(currentFunding) : undefined,
        });

        navigate('/feed');
    };

    const isFormValid = title.trim() && content.trim() && category && stage;

    return (
        <div className="create-post-page">
            <div className="create-post-page__container">
                <div className="create-post-page__header">
                    <button className="create-post-page__back" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1>Create New Post</h1>
                </div>

                <form onSubmit={handleSubmit} className="create-post-form">
                    {/* Title */}
                    <div className="form-group">
                        <label htmlFor="title">Project Title *</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your project a compelling title"
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Content */}
                    <div className="form-group">
                        <label htmlFor="content">Description *</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Describe your project, progress, and what you're looking for..."
                            className="form-textarea"
                            rows={8}
                            required
                        />
                        <span className="form-hint">
                            <Sparkles size={14} /> Tip: Use markdown for better formatting
                        </span>
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label>Category *</label>
                        <div className="category-grid">
                            {PROJECT_CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    className={`category-option ${category === cat.value ? 'active' : ''}`}
                                    onClick={() => setCategory(cat.value)}
                                >
                                    <span className="category-option__icon">{cat.icon}</span>
                                    <span className="category-option__label">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stage */}
                    <div className="form-group">
                        <label>Project Stage *</label>
                        <div className="stage-grid">
                            {STAGES.map(s => (
                                <button
                                    key={s.value}
                                    type="button"
                                    className={`stage-option ${stage === s.value ? 'active' : ''}`}
                                    onClick={() => setStage(s.value)}
                                >
                                    <span className="stage-option__label">{s.label}</span>
                                    <span className="stage-option__desc">{s.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="form-group">
                        <label htmlFor="tags">Tags</label>
                        <div className="tags-input-container">
                            {tags.map(tag => (
                                <span key={tag} className="tag-chip">
                                    #{tag}
                                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                            <input
                                id="tags"
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder={tags.length < 5 ? "Add a tag and press Enter" : ""}
                                className="tags-input"
                                disabled={tags.length >= 5}
                            />
                        </div>
                    </div>

                    {/* Funding Toggle */}
                    <div className="form-group">
                        <div className="funding-toggle">
                            <label htmlFor="hasFunding">Looking for funding?</label>
                            <button
                                type="button"
                                className={`toggle-switch ${hasFunding ? 'active' : ''}`}
                                onClick={() => setHasFunding(!hasFunding)}
                            >
                                <span className="toggle-switch__thumb" />
                            </button>
                        </div>
                    </div>

                    {/* Funding Details */}
                    {hasFunding && (
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="fundingGoal">Funding Goal ($)</label>
                                <input
                                    id="fundingGoal"
                                    type="number"
                                    value={fundingGoal}
                                    onChange={(e) => setFundingGoal(e.target.value)}
                                    placeholder="150000"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="currentFunding">Current Funding ($)</label>
                                <input
                                    id="currentFunding"
                                    type="number"
                                    value={currentFunding}
                                    onChange={(e) => setCurrentFunding(e.target.value)}
                                    placeholder="0"
                                    className="form-input"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!isFormValid || isSubmitting}
                        >
                            {isSubmitting ? 'Publishing...' : 'Publish Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostPage;
