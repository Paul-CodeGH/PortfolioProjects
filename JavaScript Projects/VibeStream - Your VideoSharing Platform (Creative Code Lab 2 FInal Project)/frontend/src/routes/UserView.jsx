// frontend/src/routes/UserView.jsx
/*
 * The UserView component displays the current user’s profile information,
 * lets them click their avatar to upload a new picture, and change their password.
 *
 * We pull the user object and an updatePicture function from AuthContext so we have
 * the latest profile data and can update it globally when the picture changes.
 *
 * Local state holds the new password as the user types, and a ref points to the
 * hidden file input so clicking the avatar opens the file chooser.
 *
 * When the avatar (or placeholder) is clicked, we trigger the file input. Once a
 * file is selected, we wrap it in FormData and send it to the `/auth/picture`
 * endpoint; on success, we call updatePicture so the new image appears immediately.
 *
 * For password updates, we require a non-empty password. Clicking “Save” sends a
 * PUT to `/auth/password`; on success we alert the user and clear the input,
 * and on failure we show the error message.
 *
 * Throughout, we use simple inline styles to control layout and spacing,
 * and we disable inputs for username and role since those aren’t editable here.
 */

import React, { useState, useContext, useRef } from 'react';
import { AuthContext }                        from '../context/AuthContext';
import api                                    from '../services/api';
import TitleNav                               from '../components/TitleNav';

export default function UserView() {
    const { user, updatePicture } = useContext(AuthContext);
    const [password, setPassword] = useState('');
    const fileInputRef            = useRef();

    const pictureUrl = user.picture
        ? `/uploads/${user.picture}`
        : null;

    const handleUpdate = async () => {
        if (!password.trim()) {
            alert('Please type a new password');
            return;
        }
        try {
            await api.put('/auth/password', { password });
            alert('Password updated');
            setPassword('');
        } catch (err) {
            alert(err.response?.data?.error || 'Update failed');
        }
    };

    const handlePictureChange = async e => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('picture', file);
        try {
            const res = await api.put('/auth/picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updatePicture(res.data.picture);
        } catch (err) {
            alert(err.response?.data?.error || 'Upload failed');
        }
    };

    return (
        <>
            <TitleNav title="Profile Page" />

            <div
                className="profile-container"
                style={{
                    /* override CSS to reduce vertical gaps */
                    padding: '0.5rem 0',
                    minHeight: 'auto',
                }}
            >
                <div className="profile-box">
                    <h2>Your Profile</h2>

                    {/* Always show a clickable avatar placeholder or your picture */}
                    <div
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            display: 'block',
                            margin: '0 auto 1rem',
                            cursor: 'pointer',
                            backgroundColor: '#f0f0f0',
                            backgroundImage: pictureUrl
                                ? `url(${pictureUrl})`
                                : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '2px dashed #ccc',
                        }}
                    />

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handlePictureChange}
                    />

                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        <input
                            type="text"
                            value={user.username}
                            disabled
                            style={{
                                width: '100%',
                                marginTop: '0.25rem',
                                height: '50px',
                                border: '1px solid #ccc',
                                borderRadius: '20px',
                                paddingLeft: '15px'
                            }}
                        />
                    </label>

                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Type a new password in here"
                            style={{
                                width: '100%',
                                marginTop: '0.25rem',
                                height: '50px',
                                border: '1px solid #ccc',
                                borderRadius: '20px',
                                paddingLeft: '15px'
                            }}
                        />
                    </label>

                    <label style={{ display: 'block', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={user.role}
                            disabled
                            style={{
                                width: '100%',
                                marginTop: '0.25rem',
                                height: '50px',
                                border: '1px solid #ccc',
                                borderRadius: '20px',
                                paddingLeft: '15px'
                            }}
                        />
                    </label>

                    <button
                        onClick={handleUpdate}
                        style={{
                            width: '30%',
                            display: 'block',
                            marginLeft: 'auto',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            background: '#3F44D1',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </>
    );
}
