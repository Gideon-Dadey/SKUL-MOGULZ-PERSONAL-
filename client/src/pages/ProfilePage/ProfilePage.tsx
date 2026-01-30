import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Edit2, Plus, MoreHorizontal, Briefcase, GraduationCap, Camera, Trash2
} from 'lucide-react';
import PostCard from '../../components/PostCard/PostCard';
import { mockUsers } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import api, { getImageUrl } from '../../services/api';
import { Experience, Education } from '../../types';
import Modal from '../../components/Modal/Modal';
import { DEFAULT_AVATAR } from '../../components/Logo';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuth();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isBannerUploading, setIsBannerUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const { updateProfile } = useAuth();

    // Modal State
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'about' | 'experience' | 'education' | 'skills' | null;
        item?: any; // For editing specific items
    }>({
        isOpen: false,
        type: null,
        item: null
    });

    // Form State
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        // If visiting /profile, redirect to /profile/:username
        if (!username && currentUser?.username) {
            navigate(`/profile/${currentUser.username}`, { replace: true });
        }
    }, [username, currentUser, navigate]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setIsLoading(true);

                let user;
                if (username) {
                    user = await authService.getProfile(username);
                } else if (currentUser) {
                    // Fetch fresh data to ensure metrics like connectionCount are accurate
                    user = await authService.getMe();
                }

                if (user) {
                    setProfileUser(user);

                    const userId = user._id || user.id;
                    const response = await api.get(`/projects?author=${userId}`);

                    const adaptedPosts = response.data.map((p: any) => ({
                        ...p,
                        id: p._id || p.id,
                        likes: Array.isArray(p.likes) ? p.likes.length : (p.likes || 0),
                        likedBy: Array.isArray(p.likes) ? p.likes : [],
                        comments: (p.comments || []).map((c: any) => ({
                            ...c,
                            id: c._id || c.id,
                            author: { ...c.author, id: c.author?._id || c.author?.id }
                        })),
                        author: {
                            ...p.author,
                            id: p.author?._id || p.author?.id
                        }
                    }));
                    setUserPosts(adaptedPosts);
                }
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (username || currentUser) {
            fetchProfileData();
        }
    }, [username, currentUser]);

    // Initialize form data when modal opens
    useEffect(() => {
        if (modalState.isOpen && modalState.type) {
            if (modalState.type === 'about') {
                setFormData({ bio: profileUser.bio || '' });
            } else if (modalState.type === 'skills') {
                setFormData({ skillInput: '', skills: profileUser.interests || [] });
            } else if (modalState.item) {
                // Editing existing item
                setFormData({ ...modalState.item });
            } else {
                // Adding new item
                if (modalState.type === 'experience') {
                    setFormData({
                        title: '',
                        company: '',
                        location: '',
                        startDate: '',
                        endDate: '',
                        current: false,
                        description: ''
                    });
                } else if (modalState.type === 'education') {
                    setFormData({
                        school: '',
                        degree: '',
                        fieldOfStudy: '',
                        startDate: '',
                        endDate: '',
                        activities: '',
                        description: ''
                    });
                }
            }
        }
    }, [modalState, profileUser]);


    const handleAvatarClick = () => {
        if (isOwnProfile && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const updatedUser = await updateProfile(formData as any);
            setProfileUser((prev: any) => ({ ...prev, avatar: updatedUser.avatar }));
        } catch (error) {
            console.error("Failed to upload avatar", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleBannerClick = () => {
        if (isOwnProfile && bannerInputRef.current) {
            bannerInputRef.current.click();
        }
    };

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('banner', file);
            const updatedUser = await updateProfile(formData as any);
            setProfileUser((prev: any) => ({ ...prev, banner: updatedUser.banner }));
        } catch (error) {
            console.error("Failed to upload banner", error);
            alert("Failed to upload banner image. Please try again.");
        } finally {
            setIsBannerUploading(false);
        }
    };

    const handleDeletePost = (postId: string) => {
        setUserPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
    };

    // Modal Handlers
    const openModal = (type: 'about' | 'experience' | 'education' | 'skills', item: any = null) => {
        setModalState({ isOpen: true, type, item });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, type: null, item: null });
        setFormData({});
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: checked }));
    };

    const handleSave = async () => {
        try {
            let updatedData: any = {};

            if (modalState.type === 'about') {
                updatedData = { bio: formData.bio };
            } else if (modalState.type === 'skills') {
                updatedData = { interests: formData.skills };
            } else if (modalState.type === 'experience') {
                const newExperience = { ...formData, id: formData.id || Date.now().toString() };
                const currentExperience = profileUser.experience || [];

                updatedData = {
                    experience: modalState.item
                        ? currentExperience.map((ex: Experience) => ex.id === modalState.item.id ? newExperience : ex)
                        : [newExperience, ...currentExperience]
                };
            } else if (modalState.type === 'education') {
                const newEducation = { ...formData, id: formData.id || Date.now().toString() };
                const currentEducation = profileUser.education || [];

                updatedData = {
                    education: modalState.item
                        ? currentEducation.map((ed: Education) => ed.id === modalState.item.id ? newEducation : ed)
                        : [newEducation, ...currentEducation]
                };
            }

            const updatedUser = await updateProfile(updatedData);
            if (updatedUser) {
                setProfileUser((prev: any) => ({ ...prev, ...updatedUser }));
                closeModal();
            }
        } catch (error) {
            console.error("Failed to save profile data", error);
            alert("Failed to save changes. Please try again.");
        }
    };

    const handleDeleteItem = async () => {
        if (!modalState.item || !modalState.type) return;
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            let updatedData: any = {};

            if (modalState.type === 'experience') {
                updatedData = {
                    experience: (profileUser.experience || []).filter((ex: Experience) => ex.id !== modalState.item.id)
                };
            } else if (modalState.type === 'education') {
                updatedData = {
                    education: (profileUser.education || []).filter((ed: Education) => ed.id !== modalState.item.id)
                };
            }

            const updatedUser = await updateProfile(updatedData);
            if (updatedUser) {
                setProfileUser((prev: any) => ({ ...prev, ...updatedUser }));
                closeModal();
            }
        } catch (error) {
            console.error("Failed to delete item", error);
            alert("Failed to delete item. Please try again.");
        }
    };

    // Skills specific handlers
    const addSkill = () => {
        if (formData.skillInput && !formData.skills.includes(formData.skillInput)) {
            setFormData((prev: any) => ({
                ...prev,
                skills: [...prev.skills, prev.skillInput],
                skillInput: ''
            }));
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData((prev: any) => ({
            ...prev,
            skills: prev.skills.filter((skill: string) => skill !== skillToRemove)
        }));
    };


    if (isLoading) return <div className="profile-page"><div className="loading-spinner"></div></div>;
    if (!profileUser) return <div className="profile-page">User not found</div>;

    const isOwnProfile = currentUser?.id === (profileUser._id || profileUser.id);

    return (
        <div className="profile-layout">
            <main className="profile-main">
                {/* Hero Section */}
                <div className="profile-card profile-hero">
                    <div className="profile-hero__banner" style={{
                        backgroundImage: profileUser.banner ? `url(${getImageUrl(profileUser.banner)})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}>
                        {isOwnProfile && (
                            <>
                                <button
                                    className="profile-hero__banner-edit"
                                    onClick={handleBannerClick}
                                    aria-label="Edit Banner"
                                >
                                    {isBannerUploading ? (
                                        <div className="upload-spinner-sm"></div>
                                    ) : (
                                        <Camera size={18} />
                                    )}
                                </button>
                                <input
                                    type="file"
                                    ref={bannerInputRef}
                                    className="hidden-input"
                                    accept="image/*"
                                    onChange={handleBannerChange}
                                    style={{ display: 'none' }}
                                />
                            </>
                        )}
                    </div>
                    <div className="profile-hero__content">
                        <div className="profile-hero__top">
                            <div
                                className={`profile-hero__avatar-container ${isOwnProfile ? 'editable' : ''}`}
                                onClick={handleAvatarClick}
                            >
                                <img
                                    src={getImageUrl(profileUser.avatar) || DEFAULT_AVATAR}
                                    alt={profileUser.firstName}
                                    className="profile-hero__avatar"
                                />
                                {isOwnProfile && (
                                    <div className="profile-hero__avatar-overlay">
                                        {isUploading ? (
                                            <div className="upload-spinner"></div>
                                        ) : (
                                            <Camera size={24} />
                                        )}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden-input"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            {isOwnProfile && (
                                <button className="profile-hero__edit-btn" aria-label="Edit Profile">
                                    <Edit2 size={18} />
                                </button>
                            )}
                        </div>

                        <div className="profile-hero__info">
                            <div className="profile-hero__text">
                                <h1 className="profile-hero__name">
                                    {profileUser.firstName} {profileUser.lastName}
                                </h1>
                                <p className="profile-hero__headline">
                                    {profileUser.headline || profileUser.bio || "Student Entrepreneur | Building the next big thing in EdTech"}
                                </p>
                                <div className="profile-hero__location">
                                    <MapPin size={16} />
                                    <span>{profileUser.location || "San Francisco Bay Area"}</span> • <Link to="/contact-info">Contact info</Link>
                                </div>
                                <Link to="/connections" className="profile-hero__connections">
                                    {(() => {
                                        const count = Number(profileUser.connectionsCount ?? profileUser.connections?.length ?? 0);
                                        return `${count} connection${count !== 1 ? 's' : ''}`;
                                    })()}
                                </Link>
                            </div>

                            <div className="profile-hero__actions">
                                {isOwnProfile ? (
                                    <>
                                        <button className="btn btn-primary btn--md">Open to</button>
                                        <button className="btn btn-outline btn--md">Add profile section</button>
                                        <button className="btn btn-outline btn--icon"><MoreHorizontal size={20} /></button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn btn-primary btn--md">Connect</button>
                                        <button className="btn btn-outline btn--md">Message</button>
                                        <button className="btn btn-outline btn--md">More</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div className="profile-card profile-section">
                        <div className="profile-section__header">
                            <div className="profile-section__header-left">
                                <h2>Activity</h2>
                                <span className="profile-section__followers">{Math.floor((profileUser.connectionsCount || profileUser.connections?.length || 0) * 2.5 + 42)} followers</span>
                            </div>
                            <div className="profile-section__header-actions">
                                {isOwnProfile ? (
                                    <button className="btn btn-outline btn--sm">Create a post</button>
                                ) : (
                                    <button className="btn btn-outline btn--sm">Follow</button>
                                )}
                                {isOwnProfile && <button className="profile-section__edit" aria-label="Edit Activity"><Edit2 size={18} /></button>}
                            </div>
                        </div>

                        <div className="profile-tabs">
                            <button className="profile-tab active">Posts</button>
                            <button className="profile-tab">Comments</button>
                            <button className="profile-tab">Images</button>
                        </div>

                        <div className="profile-activity-list">
                            {userPosts.length > 0 ? (
                                userPosts.slice(0, 3).map(post => (
                                    <PostCard key={post.id} post={post} compact={true} onDelete={handleDeletePost} />
                                ))
                            ) : (
                                <div className="profile-empty">
                                    <p>No recent activity</p>
                                </div>
                            )}
                        </div>

                        <button className="profile-section__footer-link">
                            Show all activity <span className="arrow">→</span>
                        </button>
                    </div>
                </div>

                {/* About Section */}
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <h2>About</h2>
                        {isOwnProfile && (
                            <button className="profile-section__edit" onClick={() => openModal('about')}>
                                <Edit2 size={18} />
                            </button>
                        )}
                    </div>
                    <div className="profile-section__content">
                        <p>{profileUser.bio || "Click edit to add a bio about yourself."}</p>
                    </div>
                </div>

                {/* Experience Section */}
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <h2>Experience</h2>
                        {isOwnProfile && (
                            <div className="profile-section__actions">
                                <button className="profile-section__add" onClick={() => openModal('experience')}>
                                    <Plus size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="profile-list">
                        {(profileUser.experience && profileUser.experience.length > 0) ? (
                            profileUser.experience.map((exp: Experience) => (
                                <div key={exp.id} className="profile-list-item">
                                    <div className="profile-list-item__icon">
                                        <Briefcase size={24} />
                                    </div>
                                    <div className="profile-list-item__content">
                                        <h3>{exp.title}</h3>
                                        <h4>{exp.company} • {exp.current ? 'Present' : ''}</h4>
                                        <span className="profile-list-item__date">
                                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                        </span>
                                        {exp.location && <span className="profile-list-item__location">{exp.location}</span>}
                                        {exp.description && <p>{exp.description}</p>}
                                    </div>
                                    {isOwnProfile && (
                                        <button className="profile-section__edit" onClick={() => openModal('experience', exp)}>
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No experience added yet.</p>
                        )}
                    </div>
                </div>

                {/* Education Section */}
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <h2>Education</h2>
                        {isOwnProfile && (
                            <div className="profile-section__actions">
                                <button className="profile-section__add" onClick={() => openModal('education')}>
                                    <Plus size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="profile-list">
                        {(profileUser.education && profileUser.education.length > 0) ? (
                            profileUser.education.map((edu: Education) => (
                                <div key={edu.id} className="profile-list-item">
                                    <div className="profile-list-item__icon">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div className="profile-list-item__content">
                                        <h3>{edu.school}</h3>
                                        <h4>{edu.degree}, {edu.fieldOfStudy}</h4>
                                        <span className="profile-list-item__date">
                                            {edu.startDate} - {edu.endDate}
                                        </span>
                                        {edu.activities && <p>Activities: {edu.activities}</p>}
                                        {edu.description && <p>{edu.description}</p>}
                                    </div>
                                    {isOwnProfile && (
                                        <button className="profile-section__edit" onClick={() => openModal('education', edu)}>
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No education added yet.</p>
                        )}
                    </div>
                </div>

                {/* Skills Section */}
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <h2>Skills</h2>
                        {isOwnProfile && (
                            <div className="profile-section__actions">
                                <button className="profile-section__edit" onClick={() => openModal('skills')}>
                                    <Edit2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="profile-skills-grid">
                        {(profileUser.interests && profileUser.interests.length > 0) ? (
                            profileUser.interests.map((skill: string, index: number) => (
                                <div key={skill} className="skill-item">
                                    <h3>{skill}</h3>
                                    <button className="btn btn-primary btn--xs">
                                        {Math.floor((profileUser.connectionsCount || profileUser.connections?.length || 0) * (0.1 + index * 0.05) + (5 - index))} endorsements
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No skills added yet.</p>
                        )}
                    </div>
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className="profile-sidebar">
                <div className="profile-card sidebar-card">
                    <div className="sidebar-card__header">
                        <h3>Profile language</h3>
                        <button className="sidebar-card__icon-btn"><Edit2 size={16} /></button>
                    </div>
                    <div className="sidebar-card__content">
                        <p className="text-muted">English</p>
                    </div>
                    <div className="sidebar-card__divider"></div>
                    <div className="sidebar-card__header">
                        <h3>Public profile & URL</h3>
                        <button className="sidebar-card__icon-btn"><Edit2 size={16} /></button>
                    </div>
                    <div className="sidebar-card__content">
                        <p className="text-muted text-sm">www.skulmogulz.com/in/{profileUser.username}</p>
                    </div>
                </div>

                <div className="profile-card sidebar-card">
                    <div className="sidebar-card__header">
                        <h3>People also viewed</h3>
                    </div>
                    <div className="sidebar-people-list">
                        {mockUsers.filter((u: any) => u.id !== (profileUser._id || profileUser.id)).slice(0, 5).map((u: any) => (
                            <div key={u.id} className="sidebar-person">
                                <img
                                    src={getImageUrl(u.avatar) || DEFAULT_AVATAR}
                                    className="sidebar-person__avatar"
                                    alt=""
                                />
                                <div className="sidebar-person__info">
                                    <Link to={`/profile/${u.username}`} className="sidebar-person__name">
                                        {u.firstName} {u.lastName}
                                    </Link>
                                    <p className="sidebar-person__headline">{u.role === 'student' ? 'Student Founder' : 'Angel Investor'}</p>
                                    <button className="btn btn-outline btn--xs">Connect</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Modals */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={
                    modalState.type === 'about' ? 'Edit About' :
                        modalState.type === 'experience' ? (modalState.item ? 'Edit Experience' : 'Add Experience') :
                            modalState.type === 'education' ? (modalState.item ? 'Edit Education' : 'Add Education') :
                                modalState.type === 'skills' ? 'Edit Skills' : ''
                }
            >
                {modalState.type === 'about' && (
                    <div className="modal-form">
                        <div className="modal-form-group">
                            <label className="modal-form-label">Summary</label>
                            <textarea
                                name="bio"
                                value={formData.bio || ''}
                                onChange={handleFormChange}
                                className="modal-form-textarea"
                                rows={6}
                                placeholder="Write about yourself..."
                            />
                        </div>
                        <div className="modal-form-actions">
                            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}

                {modalState.type === 'experience' && (
                    <div className="modal-form">
                        <div className="modal-form-group">
                            <label className="modal-form-label">Title *</label>
                            <input type="text" name="title" value={formData.title || ''} onChange={handleFormChange} className="modal-form-input" placeholder="Ex: Retail Sales Manager" />
                        </div>
                        <div className="modal-form-group">
                            <label className="modal-form-label">Company name *</label>
                            <input type="text" name="company" value={formData.company || ''} onChange={handleFormChange} className="modal-form-input" placeholder="Ex: Microsoft" />
                        </div>
                        <div className="modal-form-group">
                            <label className="modal-form-label">Location</label>
                            <input type="text" name="location" value={formData.location || ''} onChange={handleFormChange} className="modal-form-input" placeholder="Ex: London, United Kingdom" />
                        </div>
                        <div className="form-row">
                            <div className="modal-form-group">
                                <label className="modal-form-label">Start Date *</label>
                                <input type="text" name="startDate" value={formData.startDate || ''} onChange={handleFormChange} className="modal-form-input" placeholder="Month Year" />
                            </div>
                            <div className="modal-form-group">
                                <label className="modal-form-label">End Date</label>
                                <input type="text" name="endDate" value={formData.endDate || ''} onChange={handleFormChange} className="modal-form-input" placeholder="Month Year" disabled={formData.current} />
                            </div>
                        </div>
                        <div className="modal-form-checkbox">
                            <input type="checkbox" name="current" checked={formData.current || false} onChange={handleCheckboxChange} id="current-role" />
                            <label htmlFor="current-role">I am currently working in this role</label>
                        </div>
                        <div className="modal-form-group">
                            <label className="modal-form-label">Description</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleFormChange} className="modal-form-textarea" />
                        </div>
                        <div className="modal-form-actions">
                            {modalState.item && (
                                <button className="btn btn-outline" style={{ marginRight: 'auto', borderColor: 'red', color: 'red' }} onClick={handleDeleteItem}>Delete</button>
                            )}
                            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}

                {modalState.type === 'education' && (
                    <div className="modal-form">
                        <div className="modal-form-group">
                            <label className="modal-form-label">School *</label>
                            <input type="text" name="school" value={formData.school || ''} onChange={handleFormChange} className="modal-form-input" placeholder="Ex: Boston University" />
                        </div>
                        <div className="modal-form-group">
                            <label className="modal-form-label">Degree</label>
                            <input type="text" name="degree" value={formData.degree || ''} onChange={handleFormChange} className="modal-form-input" placeholder="Ex: Bachelor's" />
                        </div>
                        <div className="modal-form-group">
                            <label className="modal-form-label">Field of study</label>
                            <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy || ''} onChange={handleFormChange} className="modal-form-input" placeholder="Ex: Business" />
                        </div>
                        <div className="form-row">
                            <div className="modal-form-group">
                                <label className="modal-form-label">Start Date</label>
                                <input type="text" name="startDate" value={formData.startDate || ''} onChange={handleFormChange} className="modal-form-input" placeholder="Month Year" />
                            </div>
                            <div className="modal-form-group">
                                <label className="modal-form-label">End Date (or expected)</label>
                                <input type="text" name="endDate" value={formData.endDate || ''} onChange={handleFormChange} className="modal-form-input" placeholder="Month Year" />
                            </div>
                        </div>
                        <div className="modal-form-group">
                            <label className="modal-form-label">Activities and societies</label>
                            <textarea name="activities" value={formData.activities || ''} onChange={handleFormChange} className="modal-form-textarea" />
                        </div>
                        <div className="modal-form-group">
                            <label className="modal-form-label">Description</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleFormChange} className="modal-form-textarea" />
                        </div>
                        <div className="modal-form-actions">
                            {modalState.item && (
                                <button className="btn btn-outline" style={{ marginRight: 'auto', borderColor: 'red', color: 'red' }} onClick={handleDeleteItem}>Delete</button>
                            )}
                            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}

                {modalState.type === 'skills' && (
                    <div className="modal-form">
                        <div className="modal-form-group">
                            <label className="modal-form-label">Add a skill</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    name="skillInput"
                                    value={formData.skillInput || ''}
                                    onChange={handleFormChange}
                                    className="modal-form-input"
                                    placeholder="Ex: Project Management"
                                />
                                <button className="btn btn-outline" onClick={addSkill}>Add</button>
                            </div>
                        </div>
                        <div className="skills-tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                            {formData.skills && formData.skills.map((skill: string) => (
                                <div key={skill} style={{
                                    background: 'var(--bg-main)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem'
                                }}>
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(skill)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="modal-form-actions">
                            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProfilePage;
