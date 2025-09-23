/*
 * The App component sets up all of our client-side routing and wraps the entire
 * interface in a BrowserRouter so navigation happens without full page reloads.
 * We always render a NavBar at the top and a Footer at the bottom.
 *
 * Inside the main container, we define:
 *   • Public routes for the homepage, login, and registration.
 *   • Protected routes for profile, chat, videos, my-videos, video details, and upload—
 *     users must be logged in to access these.
 *   • A special /admin route that only appears if the current user’s role is admin,
 *     also wrapped in a ProtectedRoute so only admins can get in.
 *
 * This layout keeps our routing logic clear, enforces access control in one place,
 * and makes it easy to add or remove pages as our app evolves.
 */

import React, { useContext }   from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContext }         from './context/AuthContext';

import NavBar       from './components/NavBar';
import PublicPage   from './routes/PublicPage';
import Login        from './routes/Login.jsx';
import Register     from './routes/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage    from './routes/AdminPage';
import UserView     from './routes/UserView';
import Chat         from './routes/Chat';
import Videos       from './routes/Videos';
import MyVideos     from './routes/MyVideos';
import VideoDetail  from './routes/VideoDetail';
import UploadVideo  from './routes/UploadVideo';
import Footer       from './components/Footer';

export default function App() {
    const { user } = useContext(AuthContext);

    return (
        <BrowserRouter>
            <NavBar />
            <main>
                <div className="container">
                    <Routes>
                        <Route path="/" element={<PublicPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute><UserView /></ProtectedRoute>
                            }
                        />

                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute><Chat /></ProtectedRoute>
                            }
                        />

                        <Route
                            path="/videos"
                            element={
                                <ProtectedRoute><Videos /></ProtectedRoute>
                            }
                        />

                        <Route
                            path="/my-videos"
                            element={
                                <ProtectedRoute><MyVideos /></ProtectedRoute>
                            }
                        />

                        <Route
                            path="/videos/:id"
                            element={
                                <ProtectedRoute><VideoDetail /></ProtectedRoute>
                            }
                        />

                        <Route
                            path="/upload"
                            element={
                                <ProtectedRoute><UploadVideo /></ProtectedRoute>
                            }
                        />

                        {user.role === 'admin' && (
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute><AdminPage /></ProtectedRoute>
                                }
                            />
                        )}
                    </Routes>
                </div>
            </main>
            <Footer />
        </BrowserRouter>
    );
}
