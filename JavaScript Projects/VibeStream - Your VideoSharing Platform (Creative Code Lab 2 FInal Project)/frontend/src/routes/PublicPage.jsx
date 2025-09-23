// frontend/src/routes/PublicPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/vibestreamlogo.png';

const featureCategories = [
    {
        name: 'Entertainment',
        desc: 'Dive into endless entertainment videos.'
    },
    {
        name: 'Educational',
        desc: 'Learn with high-quality tutorials and talks.'
    },
    {
        name: 'Automotive',
        desc: 'Explore the latest in cars and motorsports.'
    },
    {
        name: 'Sports',
        desc: 'Catch highlights and live action from top sports.'
    }
];

export default function PublicPage() {
    const navigate = useNavigate();

    return (
        <div>
            <section className="hero">
                <div className="hero-content">
                    <h1>Welcome to VibeStream</h1>
                    <p>
                        Your one-stop source for the best, highest quality videos in the world!
                    </p>
                    <p>
                        Sign up or log in to join our community and stay informed.
                    </p>
                    <div
                        style={{
                            marginTop: '1.5rem',
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center'  // center the buttons
                        }}
                    >
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                background: '#3F44D1',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.75rem 1.5rem',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                background: 'transparent',
                                color: '#3F44D1',
                                border: '2px solid #3F44D1',
                                borderRadius: '4px',
                                padding: '0.75rem 1.5rem',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
                <div className="hero-image-wrap">
                    <img
                        src={logo}
                        alt="VibeStream logo"
                        className="hero-image"
                        style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}
                    />
                </div>
            </section>

            {/* Feature Highlights */}
            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '2rem',
                    padding: '2rem 1rem',
                    paddingBottom: '6rem'  // ensure space above the fixed footer
                }}
            >
                {featureCategories.map((f) => (
                    <div
                        key={f.name}
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            textAlign: 'center'
                        }}
                    >
                        <h3 style={{ color: '#3F44D1', marginBottom: '0.5rem' }}>
                            {f.name}
                        </h3>
                        <p style={{ color: '#555' }}>{f.desc}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}
