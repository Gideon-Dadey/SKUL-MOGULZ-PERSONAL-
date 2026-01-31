import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CallProvider } from './context/CallContext';
import Navbar from './components/Navbar/Navbar';
import FeedPage from './pages/FeedPage/FeedPage';
import CreatePostPage from './pages/CreatePostPage/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage/PostDetailPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import NetworkPage from './pages/NetworkPage/NetworkPage';
import ConnectionsPage from './pages/NetworkPage/ConnectionsPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import MessagesPage from './pages/MessagesPage/MessagesPage';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage';
import SavedPage from './pages/SavedPage/SavedPage';
import Logo from './components/Logo';
import './styles/index.css';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};


function AppContent() {
    const { isAuthenticated } = useAuth();

    return (
        <Router>
            <div className="app">
                <Navbar />
                <Routes>
                    { }
                    <Route path="/login" element={
                        isAuthenticated ? <Navigate to="/feed" replace /> : <LoginPage />
                    } />
                    <Route path="/register" element={
                        isAuthenticated ? <Navigate to="/feed" replace /> : <RegisterPage />
                    } />

                    { }
                    <Route path="/" element={
                        <ProtectedRoute><Navigate to="/feed" replace /></ProtectedRoute>
                    } />
                    <Route path="/feed" element={
                        <ProtectedRoute><FeedPage /></ProtectedRoute>
                    } />
                    <Route path="/post/:id" element={
                        <ProtectedRoute><PostDetailPage /></ProtectedRoute>
                    } />
                    <Route path="/create-post" element={
                        <ProtectedRoute><CreatePostPage /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute><ProfilePage /></ProtectedRoute>
                    } />
                    <Route path="/profile/:username" element={
                        <ProtectedRoute><ProfilePage /></ProtectedRoute>
                    } />
                    <Route path="/network" element={
                        <ProtectedRoute><NetworkPage /></ProtectedRoute>
                    } />
                    <Route path="/connections" element={
                        <ProtectedRoute><ConnectionsPage /></ProtectedRoute>
                    } />
                    <Route path="/projects" element={
                        <ProtectedRoute><ProjectsPage /></ProtectedRoute>
                    } />
                    <Route path="/messages" element={
                        <ProtectedRoute><MessagesPage /></ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                        <ProtectedRoute><NotificationsPage /></ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                        <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
                    } />
                    <Route path="/saved" element={
                        <ProtectedRoute><SavedPage /></ProtectedRoute>
                    } />


                    { }
                    <Route path="*" element={<Navigate to="/feed" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <SocketProvider>
                    <CallProvider>
                        <AppContent />
                    </CallProvider>
                </SocketProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}




const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await login(email, password);
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-brand">
                        <Logo size={48} />
                        <h1 className="auth-brand__text">Skul Mogulz</h1>
                    </div>
                    <h2 className="auth-heading">Welcome back</h2>
                    <p className="auth-subheading">
                        Don't have an account? <Link to="/register" className="auth-link">Join now</Link>
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Email or username</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div className="form-label-row">
                                <label className="form-label">Password</label>
                                <a href="#" className="form-forgot">Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-checkbox">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember">Keep me signed in</label>
                        </div>

                        <button type="submit" className="btn btn-primary btn--lg" disabled={loading}>
                            {loading ? (
                                <span className="btn-loading">Signing in...</span>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="auth-social">
                        <button className="btn btn-social">
                            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            Continue with Google
                        </button>
                        <button className="btn btn-social">
                            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            Continue with GitHub
                        </button>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-visual">
                        <div className="auth-visual__content">
                            <h3>Connect. Innovate. Succeed.</h3>
                            <p>Join thousands of ambitious students and forward-thinking investors on the premier platform for young entrepreneurs.</p>
                            <div className="auth-visual__stats">
                                <div className="auth-visual__stat">
                                    <span className="auth-visual__stat-value">Early</span>
                                    <span className="auth-visual__stat-label">Access Stage</span>
                                </div>
                                <div className="auth-visual__stat">
                                    <span className="auth-visual__stat-value">100%</span>
                                    <span className="auth-visual__stat-label">Student-Led</span>
                                </div>
                                <div className="auth-visual__stat">
                                    <span className="auth-visual__stat-value">Pure</span>
                                    <span className="auth-visual__stat-label">Innovation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// REGISTER PAGE
// ============================================
const RegisterPage = () => {
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'student' as 'student' | 'investor',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
            return;
        }
        setLoading(true);
        await register(formData);
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-brand">
                        <Logo size={48} />
                        <h1 className="auth-brand__text">Skul Mogulz</h1>
                    </div>
                    <h2 className="auth-heading">Make the most of your professional life</h2>
                    <p className="auth-subheading">
                        Already on Skul Mogulz? <Link to="/login" className="auth-link">Sign in</Link>
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {step === 1 ? (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">First name</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last name</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password (6+ characters)</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="form-input"
                                        minLength={6}
                                        required
                                    />
                                </div>

                                <p className="form-terms">
                                    By clicking Continue, you agree to Skul Mogulz's{' '}
                                    <a href="#">User Agreement</a>, <a href="#">Privacy Policy</a>, and{' '}
                                    <a href="#">Cookie Policy</a>.
                                </p>

                                <button type="submit" className="btn btn-primary btn--lg">
                                    Continue
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="form-step-info">What describes you best?</p>

                                <div className="role-selector">
                                    <button
                                        type="button"
                                        className={`role-option ${formData.role === 'student' ? 'role-option--active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 'student' })}
                                    >
                                        <div className="role-option__icon">🎓</div>
                                        <div className="role-option__content">
                                            <h4>Student / Founder</h4>
                                            <p>I'm building or want to build a startup, and showcase my projects</p>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        className={`role-option ${formData.role === 'investor' ? 'role-option--active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 'investor' })}
                                    >
                                        <div className="role-option__icon">💼</div>
                                        <div className="role-option__content">
                                            <h4>Investor / Mentor</h4>
                                            <p>I want to discover and invest in promising student startups</p>
                                        </div>
                                    </button>
                                </div>

                                <div className="form-actions-row">
                                    <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                                        Back
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Creating account...' : 'Create account'}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>

                <div className="auth-right">
                    <div className="auth-visual">
                        <div className="auth-visual__content">
                            <h3>Your journey starts here</h3>
                            <p>Whether you're a student with a groundbreaking idea or an investor looking for the next big thing, Skul Mogulz is where innovation meets opportunity.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};





export default App;
