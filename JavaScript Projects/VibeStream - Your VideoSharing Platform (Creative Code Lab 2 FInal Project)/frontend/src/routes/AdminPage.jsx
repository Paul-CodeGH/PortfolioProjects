/*
 * The AdminPage component gives administrators full control over user management and video report handling.
 * When the page loads, we fetch all users (excluding the current admin) and all video reports from the server.
 * The top table displays each user’s avatar, username, and role, and provides controls to change their role
 * or delete their account entirely. Role changes and deletions trigger API calls and instantly update
 * the UI. If an admin updates their own role, we also update their permissions in AuthContext so they
 * retain the correct access level. Below that, the reports table lists every video report with its ID,
 * the reporting user (including their avatar), a link to the reported video, the feedback text, and
 * the exact date and time the report was submitted. This setup keeps all administrative actions clear,
 * responsive, and in sync with the backend.
 */

// frontend/src/routes/AdminPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import api                from '../services/api';
import { AuthContext }    from '../context/AuthContext';
import TitleNav           from '../components/TitleNav';

export default function AdminPage() {
    const { user: currentUser, updateRole: updateMyRole } = useContext(AuthContext);
    const [users,   setUsers]   = useState([]);
    const [reports, setReports] = useState([]);

    useEffect(() => {
        api.get('/admin/users')
            .then(res => setUsers(res.data.filter(u => u.username !== currentUser.username)))
            .catch(console.error);
        api.get('/admin/reports')
            .then(res => setReports(res.data))
            .catch(console.error);
    }, [currentUser.username]);

    const handleRoleChange = (id,newRole) => {
        api.put(`/admin/users/${id}/role`, {role:newRole})
            .then(() => {
                setUsers(users.map(u=>u.id===id?{...u,role:newRole}:u));
                if(id===currentUser.id) updateMyRole(newRole);
            })
            .catch(err=>alert(err.response?.data?.error||'Failed'));
    };
    const handleDelete = id => {
        if(!window.confirm('Delete this user?')) return;
        api.delete(`/admin/users/${id}`)
            .then(()=>setUsers(users.filter(u=>u.id!==id)))
            .catch(err=>alert(err.response?.data?.error||'Failed'));
    };

    return (
        <>
            <TitleNav title="Admin Page for Handling User Actions" />

            {/* ── USERS TABLE ── */}
            <div style={{padding:'2rem',display:'flex',justifyContent:'center'}}>
                <div style={{
                    width:'100%',maxWidth:'800px',background:'#fff',
                    padding:'2rem',borderRadius:'8px',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{textAlign:'center',marginBottom:'1.5rem',color:'#3F44D1'}}>
                        Admin Dashboard
                    </h2>
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                        <thead>
                        <tr style={{background:'#3F44D1',color:'#fff'}}>
                            <th style={{padding:'0.75rem'}}></th>
                            <th style={{padding:'0.75rem'}}>Username</th>
                            <th style={{padding:'0.75rem'}}>Role</th>
                            <th style={{padding:'0.75rem'}}>Change to…</th>
                            <th style={{padding:'0.75rem'}}>Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(u=>(
                            <tr key={u.id} style={{borderBottom:'1px solid #eee'}}>
                                <td style={{padding:'0.75rem'}}>
                                    {u.picture && (
                                        <img
                                            src={`/uploads/${u.picture}`}
                                            alt={`${u.username}'s avatar`}
                                            style={{width:'30px',height:'30px',borderRadius:'50%'}}
                                        />
                                    )}
                                </td>
                                <td style={{padding:'0.75rem'}}>{u.username}</td>
                                <td style={{padding:'0.75rem'}}>{u.role}</td>
                                <td style={{padding:'0.75rem'}}>
                                    <select
                                        value={u.role}
                                        onChange={e=>handleRoleChange(u.id,e.target.value)}
                                        style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}
                                    >
                                        <option value="normal">normal</option>
                                        <option value="fined">fined</option>
                                    </select>
                                </td>
                                <td style={{padding:'0.75rem'}}>
                                    <button
                                        onClick={()=>handleDelete(u.id)}
                                        style={{
                                            background:'red',color:'#fff',border:'none',
                                            padding:'0.5rem 1rem',borderRadius:'4px',cursor:'pointer'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── REPORTS TABLE ── */}
            <div style={{padding:'2rem',display:'flex',justifyContent:'center'}}>
                <div style={{
                    width:'100%',maxWidth:'800px',background:'#fff',
                    padding:'2rem',borderRadius:'8px',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{textAlign:'center',marginBottom:'1rem',color:'#3F44D1'}}>
                        Video Reports
                    </h2>
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                        <thead>
                        <tr style={{background:'#3F44D1',color:'#fff'}}>
                            <th style={{padding:'0.75rem'}}>#</th>
                            <th style={{padding:'0.75rem'}}>Reporter</th>
                            <th style={{padding:'0.75rem'}}>Video</th>
                            <th style={{padding:'0.75rem'}}>Feedback</th>
                            <th style={{padding:'0.75rem'}}>When</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reports.map(r=>(
                            <tr key={r.report_id} style={{borderBottom:'1px solid #eee'}}>
                                <td style={{padding:'0.75rem'}}>{r.report_id}</td>
                                <td style={{padding:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    {r.reporter_picture && (
                                        <img
                                            src={`/uploads/${r.reporter_picture}`}
                                            alt={`${r.reporter_username}'s avatar`}
                                            style={{width:'30px',height:'30px',borderRadius:'50%'}}
                                        />
                                    )}
                                    {r.reporter_username}
                                </td>
                                <td style={{padding:'0.75rem'}}>
                                    <a
                                        href={`/videos/${r.video_id}`}
                                        style={{color:'#3F44D1',textDecoration:'none'}}
                                    >
                                        {r.video_title}
                                    </a>
                                </td>
                                <td style={{padding:'0.75rem'}}>{r.feedback}</td>
                                <td style={{padding:'0.75rem'}}>
                                    {new Date(r.created_at).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
