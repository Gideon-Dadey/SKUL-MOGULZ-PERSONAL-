import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Sun, Moon, Bell, User } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import FeedPage from './pages/FeedPage/FeedPage';
import CreatePostPage from './pages/CreatePostPage/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage/PostDetailPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import './styles/index.css';

function AppContent() {
    const { theme, toggleTheme } = useTheme();
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <Router>
            <div className="app-container">
                <nav className="navbar">
                    <div className="logo-container">
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <div className="logo-text">SKUL MOGULZ</div>
                        </Link>
                    </div>

                    <div className="nav-links">
                        <a href="#features">Features</a>
                        <Link to="/feed">Explore</Link>
                        <a href="#investors">Investors</a>
                        <a href="#about">About</a>
                    </div>

                    <div className="nav-auth">
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {isAuthenticated ? (
                            <>
                                <Link to="/notifications" className="theme-toggle" aria-label="Notifications">
                                    <Bell size={18} />
                                </Link>
                                <Link to="/profile" className="theme-toggle" aria-label="Profile">
                                    <User size={18} />
                                </Link>
                                <button className="btn btn-outline" onClick={logout}>Log Out</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline">Log In</Link>
                                <Link to="/register" className="btn btn-primary">Sign Up</Link>
                            </>
                        )}
                    </div>
                </nav>

                <main>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/feed" element={<FeedPage />} />
                        <Route path="/post/:id" element={<PostDetailPage />} />
                        <Route path="/create-post" element={<CreatePostPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/profile/:username" element={<ProfilePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    );
}

// Login Page Component
const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await login(email, password);
        setLoading(false);
        window.location.href = '/feed';
    };

    return (
        <div className="section-padding" style={{ display: 'flex', justifyContent: 'center', minHeight: '80vh', alignItems: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '450px', width: '100%' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Sign in to continue to SKUL MOGULZ
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' }}
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' }}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

// Register Page Component
const RegisterPage = () => {
    const { register } = useAuth();
    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'student' as 'student' | 'investor',
    });
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await register(formData);
        setLoading(false);
        window.location.href = '/feed';
    };

    return (
        <div className="section-padding" style={{ display: 'flex', justifyContent: 'center', minHeight: '80vh', alignItems: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '600px', width: '100%' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Create Account</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Join the community of innovators
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div
                        className="glass-card"
                        style={{
                            padding: '1.25rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: formData.role === 'student' ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: formData.role === 'student' ? 'var(--primary-light)' : 'var(--bg-main)'
                        }}
                        onClick={() => setFormData({ ...formData, role: 'student' })}
                    >
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎓</div>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Student</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showcase projects & find investors</p>
                    </div>
                    <div
                        className="glass-card"
                        style={{
                            padding: '1.25rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: formData.role === 'investor' ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: formData.role === 'investor' ? 'var(--primary-light)' : 'var(--bg-main)'
                        }}
                        onClick={() => setFormData({ ...formData, role: 'investor' })}
                    >
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💼</div>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Investor</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Discover Gen-Z startups</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' }}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' }}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' }}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' }}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

import React from 'react';

export default App;
