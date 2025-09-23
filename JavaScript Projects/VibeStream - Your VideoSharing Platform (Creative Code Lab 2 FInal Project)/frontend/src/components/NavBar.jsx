import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/vibestreamlogo.png';
import './NavBar.css';

// NavBar component that displays the navigation bar with links and search functionality
export default function NavBar() {
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // sync search input with URL ?search=
    const [search, setSearch] = useState('');
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearch(params.get('search') || '');
    }, [location.search]);

    const handleSearchChange = e => {
        const q = e.target.value;
        setSearch(q);
        const params = new URLSearchParams(location.search);
        if (q) params.set('search', q);
        else params.delete('search');
        navigate(
            { pathname: location.pathname, search: params.toString() },
            { replace: true }
        );
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // mobile menu toggle
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(o => !o);

    return (
        <nav>
            <div className={`nav-container${menuOpen ? ' open' : ''}`}>
                {/* ——— desktop/mobile items (unchanged) ——— */}
                {token && (
                    <Link to="/videos" className="logo-link">
                        <img src={logo} alt="VibeStream" className="nav-logo" />
                    </Link>
                )}
                {token && <Link to="/upload">Upload</Link>}

                {token && (
                    <input
                        type="text"
                        className="nav-search"
                        placeholder="Search videos..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                )}

                {token && user.role === 'admin' && <Link to="/admin">Users</Link>}
                {token && <Link to="/my-videos">My Videos</Link>}
                {token && <Link to="/chat">Chat</Link>}

                {token ? (
                    <div className="user-menu" style={{ position: 'relative' }}>
                        <button
                            className="user-greeting"
                            onClick={() => navigate('/profile')}
                        >
                            Hello, {user.username}!
                        </button>
                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                            style={{
                                visibility: 'visible',
                                backgroundColor: 'red',
                                color: '#fff',
                                border: 'none',
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                width: '100%',
                                height: '60px',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/">Home</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}

                {/* ——— mobile-only: burger and slide-down ——— */}
                <button
                    className="burger"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    ☰
                </button>

                <div className="mobile-menu">
                    {token ? (
                        <>
                            <Link to="/videos" className="logo-link">
                                <img src={logo} alt="VibeStream" className="nav-logo" />
                            </Link>
                            <Link to="/upload">Upload</Link>
                            {user.role === 'admin' && <Link to="/admin">Users</Link>}
                            <Link to="/my-videos">My Videos</Link>
                            <Link to="/chat">Chat</Link>
                            <div className="user-menu" style={{ position: 'relative' }}>
                                <button
                                    className="user-greeting"
                                    onClick={() => navigate('/profile')}
                                >
                                    Hello, {user.username}!
                                </button>
                                <button
                                    className="logout-btn"
                                    onClick={handleLogout}
                                    style={{
                                        visibility: 'visible',
                                        backgroundColor: 'red',
                                        color: '#fff',
                                        border: 'none',
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        width: '100%',
                                        height: '60px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/">Home</Link>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
