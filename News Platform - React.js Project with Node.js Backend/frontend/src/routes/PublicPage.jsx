// frontend/src/routes/PublicPage.jsx
import React from 'react';
import heroImg from '../assets/logo.png';  // ← import it

export default function PublicPage() {
    return (
        <section className="hero">
            <div className="hero-content">
                <h1>Welcome to HighView</h1>
                <p>
                    Your one-stop source for the latest news, insights, and stories
                    from around the world.
                </p>
                <p>
                    Sign up or log in to join our community
                    and stay informed.
                </p>
            </div>
            <div className="hero-image-wrap">
                <img
                    src={heroImg}
                    alt="HighView news overview"
                    className="hero-image"
                />
                <p>Logo generated using AI!</p>
            </div>
        </section>
    );
}
