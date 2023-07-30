import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export const EditJobPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [skills, setSkills] = useState([]);
    const [newJob, setNewJob] = useState({
        job_title: '',
        company: '',
        location: '',
        status: '',
        date_applied: '',
        notes: '',
        skills: [],
    });

    const handleSkillChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setNewJob({ ...newJob, skills: selectedOptions });
    };

    useEffect(() => {
        axios.get('/skills')
            .then(response => {
                setSkills(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        axios.get(`/jobs/${id}`)
            .then(response => {
                const job = response.data;
                setNewJob({
                    job_title: job.job_title,
                    company: job.company,
                    location: job.location,
                    status: job.status,
                    date_applied: job.date_applied,
                    notes: job.notes,
                    skills: job.skills, // make sure that job.skills is an array of skill titles
                });
            })
            .catch(error => {
                console.error(error);
            });
    }, [id]);

    const updateJob = (event) => {
        event.preventDefault();
        axios.put(`/jobs/edit/${id}`, newJob)
            .then(response => {
                navigate('/jobs');
            })
            .catch(error => {
                console.error("Error from server: ", error);
                console.error(error);
            });
    };

    return (
        <form onSubmit={updateJob}>
            <input type="text" value={newJob.job_title} onChange={e => setNewJob({ ...newJob, job_title: e.target.value })} placeholder="Job title" required />
            <input type="text" value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} placeholder="Company" required />
            <input type="text" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} placeholder="Location" required />
            <select value={newJob.status} onChange={e => setNewJob({ ...newJob, status: e.target.value })} required>
                <option value="">--Select Status--</option>
                <option value="Applied">Applied</option>
                <option value="Waiting to hear back">Waiting to hear back</option>
                <option value="Interviewed">Interviewed</option>
                <option value="Offer Accepted">Offer Accepted</option>
                <option value="Offer Denied">Offer Denied</option>
            </select>
            <select multiple value={newJob.skills} onChange={handleSkillChange} required>
                    <option value="">--Select Skill--</option>
                    {skills.map((skill, index) => (
                        <option key={index} value={skill.skill_title}>{skill.skill_title}</option>
                    ))}
                </select>
            <input type="date" value={newJob.date_applied} onChange={e => setNewJob({ ...newJob, date_applied: e.target.value })} placeholder="Date" />
            <input type="text" value={newJob.notes} onChange={e => setNewJob({ ...newJob, notes: e.target.value })} placeholder="Notes" />
            <button type="submit">Update Job</button>
        </form>
    );
};

export default EditJobPage;