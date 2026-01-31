import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Image, X, Sparkles, Hash, DollarSign, Target, Folder } from 'lucide-react';
import { PROJECT_CATEGORIES, ProjectCategory } from '../../types';
import api from '../../services/api';
import './CreatePostPage.css';

const STAGES = [
    { value: 'idea', label: 'Idea', description: 'Just started', icon: <Sparkles size={18} /> },
    { value: 'prototype', label: 'Prototype', description: 'In progress', icon: <Target size={18} /> },
    { value: 'mvp', label: 'MVP', description: 'Ready to test', icon: <Folder size={18} /> },
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
    const location = useLocation();
    const editingPost = location.state?.post;

    useEffect(() => {
        if (editingPost) {
            setTitle(editingPost.title || '');
            setContent(editingPost.content || '');
            setCategory(editingPost.category || '');
            setStage(editingPost.projectStage || '');
            setTags(editingPost.tags || []);
            if (editingPost.fundingGoal) {
                setHasFunding(true);
                setFundingGoal(editingPost.fundingGoal.toString());
                setCurrentFunding(editingPost.currentFunding?.toString() || '0');
            }
            if (editingPost.media) {
                setPreviews(editingPost.media);
            }
        }
    }, [editingPost]);


    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPreviews = files.map(file => ({
                url: URL.createObjectURL(file),
                type: file.type.startsWith('video/') ? 'video' : 'image'
            }));
            setSelectedFiles(prev => [...prev, ...files]);
            setPreviews(prev => [...prev, ...newPreviews.map(p => p.url)]);
        }
    };

    const handleRemoveImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('category', category);
            formData.append('projectStage', stage);

            tags.forEach(tag => formData.append('tags[]', tag));

            if (hasFunding) {
                formData.append('fundingGoal', fundingGoal.replace(/[^0-9.-]+/g, ""));
                formData.append('currentFunding', currentFunding.replace(/[^0-9.-]+/g, ""));
            }

            selectedFiles.forEach(file => {
                formData.append('media', file);
            });

            if (editingPost) {
                await api.put(`/projects/${editingPost.id || editingPost._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await api.post('/projects', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            navigate('/feed');
        } catch (error) {
            console.error("Failed to create post", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                        {isSubmitting ? (editingPost ? 'Saving...' : 'Posting...') : (editingPost ? 'Save Changes' : 'Post')}
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

                        { }
                        {previews.length > 0 && (
                            <div className="create-previews">
                                {previews.map((src, idx) => {
                                    const isVideo = src.match(/\.(mp4|mov|webm|quicktime)$/i) || src.startsWith('blob:') && selectedFiles[idx]?.type.startsWith('video/') || src.includes('video');
                                    return (
                                        <div key={idx} className="preview-item">
                                            {isVideo ? (
                                                <video src={src} />
                                            ) : (
                                                <img src={src} alt="" />
                                            )}
                                            <button className="remove-preview" onClick={() => handleRemoveImage(idx)}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

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
                            <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*,video/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <button className="toolbar-btn" onClick={() => fileInputRef.current?.click()}>
                                <Image size={20} />
                            </button>
                            <button className="toolbar-btn"><Sparkles size={20} /></button>
                        </div>
                    </div>

                    <aside className="create-settings">
                        { }
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
