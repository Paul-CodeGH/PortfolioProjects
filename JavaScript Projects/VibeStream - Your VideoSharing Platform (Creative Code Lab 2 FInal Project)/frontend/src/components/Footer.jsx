// frontend/src/components/Footer.jsx
import React from 'react';

// Simple footer component for the site
export default function Footer() {
    return (
        <footer
            className="site-footer"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                zIndex: 1000
            }}
        >
            <div className="footer-container">
                © 2025 VibeStream. All rights reserved.
                <p>Creative Code Labs Project using NodeJS and ReactJS</p>
            </div>
        </footer>
    );
}
