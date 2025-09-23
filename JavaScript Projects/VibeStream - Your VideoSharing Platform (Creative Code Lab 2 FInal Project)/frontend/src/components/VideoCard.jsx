// frontend/src/components/VideoCard.jsx
import React, { useContext } from 'react';
import { useNavigate }      from 'react-router-dom';
import { AuthContext }      from '../context/AuthContext';
import api                  from '../services/api';

// VideoCard component to display individual video details
export default function VideoCard({ video, onDelete }) {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Determine current user’s ID from the JWT
    const token = localStorage.getItem('token');
    let currentUserId = null;
    if (token) {
        try {
            currentUserId = JSON.parse(atob(token.split('.')[1])).id;
        } catch {}
    }

    const canDelete =
        currentUserId === video.user_id ||
        user.role === 'admin';

    const src = `/videos/${video.filename}`;

    return (
        <div
            className="video-card"
            onClick={() => navigate(`/videos/${video.id}`)}
            style={{
                cursor: 'pointer',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '350px',
                marginBottom: '2rem',
            }}
        >
            <video
                src={src}
                controls
                style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    flexShrink: 0
                }}
            />

            <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#282c34' }}>
                    {video.title}
                </h3>

                <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#555', flex: 1 }}>
                    {video.description}
                </p>

                <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>
                    <em>Category: {video.category}</em> &nbsp;·&nbsp;
                    <strong>By {video.username}</strong>
                </p>

                {canDelete && (
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            onDelete(video);
                        }}
                        style={{
                            background: 'red',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            alignSelf: 'flex-end',
                            marginTop: '1rem'
                        }}
                    >
                        Delete
                    </button>
                )}
            </div>

            {/* Report button */}
            <button
                onClick={e => {
                    e.stopPropagation();
                    const feedback = window.prompt('Please describe the issue:');
                    if (!feedback) return;
                    api.post('/reports', { videoId: video.id, feedback })
                        .then(() => alert('Thank you; the video has been reported.'))
                        .catch(err => alert(err.response?.data?.error || 'Report failed'));
                }}
                style={{
                    background: '#FFA500',
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    alignSelf: 'flex-end',
                    margin: '0.5rem'
                }}
            >
                Report
            </button>
        </div>
    );
}
