import React from 'react';
import { ArrowRight, BarChart2, Globe, Shield, Users, Zap, Briefcase } from 'lucide-react';
import profile1 from '../assets/profile-1.png';
import profile2 from '../assets/profile-2.png';

const LandingPage: React.FC = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <span className="hero-badge">
                            <Zap size={16} /> The #1 Platform for Student Innovation
                        </span>
                        <h1 className="hero-title">
                            Launch Your <span>Startup Journey</span> While in School
                        </h1>
                        <p className="hero-desc">
                            Connect with elite investors, showcase your groundbreaking projects,
                            and join a community of world-class Gen-Z entrepreneurs.
                        </p>
                        <div className="hero-actions">
                            <button className="btn btn-primary">
                                Get Started Now <ArrowRight size={20} />
                            </button>
                            <button className="btn btn-outline">
                                View Demo
                            </button>
                        </div>
                    </div>

                    <div className="hero-visuals">
                        <div className="visual-bg-circle"></div>

                        <div className="profile-card">
                            <img src={profile1} alt="Student Entrepreneur" />
                        </div>
                        <div className="profile-card">
                            <img src={profile2} alt="Tech Innovator" />
                        </div>

                        <div className="floating-badge b-1">
                            <div className="badge-icon"><Users size={20} /></div>
                            <div className="badge-text">
                                <div>200+ Investors</div>
                                <div>Active this week</div>
                            </div>
                        </div>

                        <div className="floating-badge b-2">
                            <div className="badge-icon"><Shield size={20} /></div>
                            <div className="badge-text">
                                <div>Verified Profiles</div>
                                <div>US Industry Standard</div>
                            </div>
                        </div>

                        <div className="floating-badge b-3">
                            <div className="badge-icon"><Briefcase size={20} /></div>
                            <div className="badge-text">
                                <div>$12M Raised</div>
                                <div>By students in 2025</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-item">
                        <h3>500+</h3>
                        <p>Projects Funded</p>
                    </div>
                    <div className="stat-item">
                        <h3>$12M+</h3>
                        <p>Capital Raised</p>
                    </div>
                    <div className="stat-item">
                        <h3>15K+</h3>
                        <p>Global Students</p>
                    </div>
                    <div className="stat-item">
                        <h3>200+</h3>
                        <p>Partner Tech Hubs</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section-padding" id="features">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Built for the Next Generation</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                        Everything you need to turn your academic project into a scalable startup.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="glass-card">
                        <div className="feature-icon"><Briefcase size={28} /></div>
                        <h3 className="feature-title">Portfolio Builder</h3>
                        <p className="feature-desc">Dynamic showcases for your technical and creative projects that grab investor attention.</p>
                    </div>
                    <div className="glass-card">
                        <div className="feature-icon"><Users size={28} /></div>
                        <h3 className="feature-title">Direct Networking</h3>
                        <p className="feature-desc">Connect directly with industry leaders and angel investors interested in student-led innovation.</p>
                    </div>
                    <div className="glass-card">
                        <div className="feature-icon"><BarChart2 size={28} /></div>
                        <h3 className="feature-title">Growth Analytics</h3>
                        <p className="feature-desc">Track engagement on your projects and gain insights into what investors are looking for.</p>
                    </div>
                    <div className="glass-card">
                        <div className="feature-icon"><Globe size={28} /></div>
                        <h3 className="feature-title">Global Reach</h3>
                        <p className="feature-desc">Access opportunities and funding from across the globe, regardless of your location.</p>
                    </div>
                    <div className="glass-card">
                        <div className="feature-icon"><Shield size={28} /></div>
                        <h3 className="feature-title">Secure Funding</h3>
                        <p className="feature-desc">Safe and transparent investment processes managed by industry-standard protocols.</p>
                    </div>
                    <div className="glass-card">
                        <div className="feature-icon"><Zap size={28} /></div>
                        <h3 className="feature-title">Rapid Launch</h3>
                        <p className="feature-desc">From project submission to investor pitch in record time with our streamlined pipeline.</p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>How It Works</h2>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
                    <div style={{ flex: '1', minWidth: '250px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', color: 'var(--primary)', fontWeight: '800', marginBottom: '1rem' }}>01</div>
                        <h3>Create Profile</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Showcase your skills, education, and vision.</p>
                    </div>
                    <div style={{ flex: '1', minWidth: '250px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', color: 'var(--primary)', fontWeight: '800', marginBottom: '1rem' }}>02</div>
                        <h3>Upload Project</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Share your technical docs, demos, and pitch decks.</p>
                    </div>
                    <div style={{ flex: '1', minWidth: '250px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', color: 'var(--primary)', fontWeight: '800', marginBottom: '1rem' }}>03</div>
                        <h3>Get Funded</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Match with investors and scale your startup.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding" style={{ textAlign: 'center' }}>
                <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Ready to Scale?</h2>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                        Join thousands of student moguls already building the future.
                    </p>
                    <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                        Claim Your Spot <ArrowRight size={22} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-grid">
                    <div className="footer-info">
                        <div className="logo-text">SKUL MOGULZ</div>
                        <p>The premier launchpad for student-led innovation and professional growth.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="#projects">Browse Projects</a></li>
                            <li><a href="#investors">For Investors</a></li>
                            <li><a href="#students">For Students</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#careers">Careers</a></li>
                            <li><a href="#blog">Blog</a></li>
                            <li><a href="#press">Press</a></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#terms">Terms of Service</a></li>
                            <li><a href="#cookie">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div>© 2026 SKUL MOGULZ Inc. All rights reserved.</div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <a href="#twitter" style={{ color: 'inherit' }}>Twitter</a>
                        <a href="#linkedin" style={{ color: 'inherit' }}>LinkedIn</a>
                        <a href="#github" style={{ color: 'inherit' }}>GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
