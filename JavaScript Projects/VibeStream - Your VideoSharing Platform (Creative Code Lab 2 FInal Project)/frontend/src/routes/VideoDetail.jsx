// frontend/src/routes/VideoDetail.jsx
/*
 * The VideoDetail component loads a single video’s data by ID, displays the video player
 * along with its title, description, category, and uploader info, and lets the owner or
 * an admin delete the video. On mount (or when the ID changes), we fetch `/videos/:id`
 * and store it in state. While loading, we show a “Loading…” message. We decode the JWT
 * to find the current user’s ID and check their role, if they’re the uploader or an admin,
 * a Delete button appears. Clicking Delete prompts for confirmation, calls DELETE `/videos/:id`,
 * then redirects back to the video list. Below the details, we render the CommentsSection
 * component to show and manage comments for this video.
 */

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate }              from 'react-router-dom';
import api                                     from '../services/api';
import { AuthContext }                         from '../context/AuthContext';
import CommentsSection                         from '../components/CommentsSection';
import TitleNav                               from '../components/TitleNav';


export default function VideoDetail() {
    const { id }      = useParams();
    const navigate    = useNavigate();
    const { user }    = useContext(AuthContext);
    const [video, setVideo] = useState(null);

    useEffect(() => {
        api.get(`/videos/${id}`)
            .then(res => setVideo(res.data))
            .catch(console.error);
    }, [id]);

    if (!video) {
        return <p>Loading…</p>;
    }

    // Figure out if we can delete (owner or admin)
    let currentUserId = null;
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUserId = payload.id;
        } catch {
            currentUserId = null;
        }
    }
    const canDelete =
        currentUserId === video.user_id ||
        user.role === 'admin';

    const handleDelete = async () => {
        if (!window.confirm('Delete this video?')) return;
        try {
            await api.delete(`/videos/${video.id}`);
            navigate('/videos');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete');
        }
    };

    return (
        <>
        <TitleNav title="Individual Video Page" />
        <div style={{ padding: '2rem' }}>
            <video
                src={`/videos/${video.filename}`}
                controls
                style={{
                    width: '100%',
                    maxHeight: '600px',
                    borderRadius: '25px',
                    border: '5px solid #ccc'
                }}
            />

            <h2 style={{ marginTop: '1rem' }}>{video.title}</h2>
            <p>{video.description}</p>
            <p><em>Category:</em> {video.category}</p>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '1rem 0'
            }}>
                {video.picture && (
                    <img
                        src={`/uploads/${video.picture}`}
                        alt={`${video.username}'s avatar`}
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginRight: '0.75rem'
                        }}
                    />
                )}
                <strong>By {video.username}</strong>
            </div>

            {canDelete && (
                <button
                    onClick={handleDelete}
                    style={{
                        background: 'red',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    Delete
                </button>
            )}

            <CommentsSection videoId={video.id} />
        </div>
        </>
    );
}
