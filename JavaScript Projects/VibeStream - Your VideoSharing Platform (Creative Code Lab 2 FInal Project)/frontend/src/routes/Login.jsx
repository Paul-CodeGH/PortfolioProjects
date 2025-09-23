import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

// Login page for logging in users
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login }               = useContext(AuthContext);
    const navigate               = useNavigate();

    // Handle form submission, which logs in the user and redirects to the videos page
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/videos');
        } catch (err) {
            alert(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="auth-main">
            <div className="auth-panel">
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2 style={{ textAlign: 'center' }}>Sign In</h2>

                    <label>
                        Username
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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

                    <button type="submit">Log In</button>
                </form>
            </div>
            <div className="auth-aside">
                <h2>Welcome to Login!</h2>
                <p>Don't have an account?</p>
                <button onClick={() => navigate('/register')}>
                    Sign Up
                </button>
            </div>
        </div>
    );
}
