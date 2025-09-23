// frontend/src/components/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

// Register component for user registration
export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [picture, setPicture]   = useState(null);
    const navigate                = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            if (picture) {
                formData.append('picture', picture);
            }

            await api.post('/auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="auth-main">
            <div className="auth-aside">
                <h2>Create your account</h2>
                <p>Already have an account?</p>
                <button onClick={() => navigate('/login')}>
                    Sign In
                </button>
            </div>
            <div className="auth-panel">
                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                >
                    <h2 style={{ textAlign: 'center' }}>Sign Up</h2>

                    <label>
                        Username
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Profile Picture
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPicture(e.target.files[0])}
                        />
                    </label>

                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
}
