// frontend/src/routes/Videos.jsx
/*
 * The Videos component fetches and displays all videos from the server,
 * lets users search by keyword and narrow down by category, and handles
 * video deletions with confirmation.
 *
 * When the component mounts, it requests `/videos` and stores the result in state.
 * We read the `search` query parameter from the URL and lowercase it for
 * case-insensitive matching. Then on every render we:
 *   1. Filter the full list of videos to those whose title, description, or
 *      category includes the search term.
 *   2. If a category is selected via CategoryNav, further restrict to that category.
 *
 * If no videos match, we show a friendly message. Otherwise, we render each
 * VideoCard in a responsive three-column grid. Each card also receives an
 * onDelete handler that confirms with the user, sends DELETE `/videos/:id`,
 * and removes the video from state so the grid updates immediately.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api       from '../services/api';
import VideoCard from '../components/VideoCard';
import CategoryNav from '../components/CategoryNav';

export default function Videos() {
    const [videos, setVideos] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchParams] = useSearchParams();
    const q = searchParams.get('search')?.toLowerCase() || '';

    useEffect(() => {
        api.get('/videos')
            .then(res => setVideos(res.data))
            .catch(console.error);
    }, []);

    const handleDelete = async video => {
        if (!window.confirm('Delete this video?')) return;
        try {
            await api.delete(`/videos/${video.id}`);
            setVideos(videos.filter(v => v.id !== video.id));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete');
        }
    };

    // 1) first filter by search term
    let filtered = videos.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );

    // 2) then filter by category if any selected
    if (selectedCategory) {
        filtered = filtered.filter(v => v.category === selectedCategory);
    }

    return (
        <div style={{ padding: '2rem' }}>
            <CategoryNav
                selected={selectedCategory}
                onSelect={setSelectedCategory}
            />

            {filtered.length === 0 ? (
                <p>No videos match your criteria.</p>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '2rem',
                        marginTop: '1rem'
                    }}
                >
                    {filtered.map(v => (
                        <VideoCard
                            key={v.id}
                            video={v}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
