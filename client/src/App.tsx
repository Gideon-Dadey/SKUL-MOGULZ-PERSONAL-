import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import './styles/index.css';

function App() {
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

const Login = () => (
    <div className="section-padding" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '450px', width: '100%' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Welcome Back</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Email Address</label>
                    <input type="email" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} placeholder="name@example.com" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Password</label>
                    <input type="password" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} placeholder="••••••••" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Sign In</button>
            </form>
            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign up</Link>
            </p>
        </div>
    </div>
);

const Register = () => (
    <div className="section-padding" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '600px', width: '100%' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Create Account</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', border: '2px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Student</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Showcase projects and find investors.</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Investor</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Discover high-potential Gen-Z startups.</p>
                </div>
            </div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label>First Name</label>
                        <input type="text" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label>Last Name</label>
                        <input type="text" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Email Address</label>
                    <input type="email" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Create Account</button>
            </form>
        </div>
    </div>
);

export default App;
