import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import './styles/index.css';

function AppContent() {
    const { theme, toggleTheme } = useTheme();

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
                        <a href="#projects">Projects</a>
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
                        <Link to="/login" className="btn btn-outline">Log In</Link>
                        <Link to="/register" className="btn btn-primary">Sign Up</Link>
                    </div>
                </nav>

                <main>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

const Login = () => (
    <div className="section-padding" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '450px', width: '100%' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Welcome Back</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>Email Address</label>
                    <input type="email" style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' }} placeholder="name@example.com" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>Password</label>
                    <input type="password" style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' }} placeholder="••••••••" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Sign In</button>
            </form>
            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
            </p>
        </div>
    </div>
);

const Register = () => (
    <div className="section-padding" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '600px', width: '100%' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Create Account</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', border: '2px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Student</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showcase projects and find investors.</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }}>
                    <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Investor</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Discover high-potential Gen-Z startups.</p>
                </div>
            </div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>First Name</label>
                        <input type="text" style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>Last Name</label>
                        <input type="text" style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>Email Address</label>
                    <input type="email" style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Create Account</button>
            </form>
        </div>
    </div>
);

export default App;
