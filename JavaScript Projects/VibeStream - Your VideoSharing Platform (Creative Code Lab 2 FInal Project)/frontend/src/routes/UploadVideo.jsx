// frontend/src/routes/UploadVideo.jsx
/*
 * The UploadVideo component renders a form that lets users choose a category,
 * enter a title and description, and pick a video file to upload.
 * It keeps track of each field in local state so the form inputs stay in sync.
 * When the user submits, it ensures a file is selected, then packages up the
 * title, description, category, and file into a FormData object. This data is
 * sent to the server as a multipart/form-data POST to the `/videos` endpoint.
 * If the upload is successful, the user is automatically redirected to the
 * videos list page; if something goes wrong, an alert pops up with the error.
 */

import React, { useState } from 'react';
import { useNavigate }      from 'react-router-dom';
import api                  from '../services/api';
import TitleNav             from '../components/TitleNav';

export default function UploadVideo() {
    const [title, setTitle]           = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory]     = useState('Entertainment');
    const [videoFile, setVideoFile]   = useState(null);
    const navigate                    = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        if (!videoFile) {
            alert('Please select a video file');
            return;
        }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('video', videoFile);

        try {
            await api.post('/videos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/videos');
        } catch (err) {
            alert(err.response?.data?.error || 'Upload failed');
        }
    };

    return (
        <>
            <TitleNav title="Article Creation Page" />

            <div className="profile-container" style={{ padding: '1rem 0', minHeight: 'auto' }}>
                <div className="profile-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Upload a Video</h2>

                    <form onSubmit={handleSubmit}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Category
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    marginTop: '0.25rem',
                                    height: '50px',
                                    border: '1px solid #ccc',
                                    borderRadius: '20px',
                                    paddingLeft: '15px'
                                }}
                            >
                                <option>Entertainment</option>
                                <option>Educational</option>
                                <option>Automotive</option>
                                <option>Sports</option>
                            </select>
                        </label>

                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Title
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Title"
                                required
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
                            Description
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Description"
                                required
                                rows={4}
                                style={{
                                    width: '100%',
                                    marginTop: '0.25rem',
                                    border: '1px solid #ccc',
                                    borderRadius: '20px',
                                    padding: '15px',
                                    resize: 'vertical'
                                }}
                            />
                        </label>

                        <label style={{ display: 'block', marginBottom: '1rem' }}>
                            Video File
                            <input
                                type="file"
                                accept="video/*"
                                onChange={e => setVideoFile(e.target.files[0])}
                                required
                                style={{
                                    display: 'block',
                                    marginTop: '0.5rem'
                                }}
                            />
                        </label>

                        <button
                            type="submit"
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
                            Upload
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
