import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function NavBar() {
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav>
            <div className="nav-container">
                <Link to="/">Home</Link>
                <Link to="/dashboard">Dashboard</Link>
                {token && <Link to="/profile">Profile</Link>}
                {token && user.role === 'admin' && <Link to="/admin">Admin</Link>}
                {token ? (
                    <div className="user-menu">
                        <span className="user-greeting">Hello, {user.username}!</span>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
