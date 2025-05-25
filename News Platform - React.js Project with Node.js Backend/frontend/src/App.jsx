// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';                // ← make sure to import this
import { AuthContext } from './context/AuthContext';// ← and this

import NavBar from './components/NavBar';
import PublicPage from './routes/PublicPage';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedPage from './routes/ProtectedPage';
import AdminPage from './routes/AdminPage';
import UserView         from './routes/UserView';
import Footer from "./components/Footer.jsx";

export default function App() {
    const { user } = useContext(AuthContext);        // ← now we have `user` in scope

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
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <ProtectedPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Personal profile page */}
                                   <Route
                                     path="/profile"
                                     element={
                                       <ProtectedRoute>
                                           <UserView />
                                       </ProtectedRoute>
                                     }
                                   />

                        { /* only define this route if user.role exists */ }
                        {user.role === 'admin' && (
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute>
                                        <AdminPage />
                                    </ProtectedRoute>
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
