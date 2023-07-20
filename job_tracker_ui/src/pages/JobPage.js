import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar/Navbar';

function JobPage() {
    const [jobs, setJobs] = useState([]);
    const [newJob, setNewJob] = useState({
        job_title: '',
        company_id: '',
        location: '',
        status: '',
        date_applied: '',
        notes: '',
    });
    const [editingJob, setEditingJob] = useState(null);

    // fetch jobs from server
    useEffect(() => {
        axios.get('/jobs')
            .then(response => {
                setJobs(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    const createJob = (event) => {
        event.preventDefault();
        // post request to create a new job
        axios.post('/jobs', newJob)
            .then(response => {
                // add the newly created job to the jobs list
                setJobs([...jobs, response.data]);
                // reset newJob state
                setNewJob({ job_title: '', company_id: '', location: '', status: '', date_applied: '', notes: '' });
            })
            .catch(error => {
                console.error(error);
            });
    };

    const deleteJob = (job_id) => {
        // delete request to delete a job
        axios.delete(`/jobs/${job_id}`)
            .then(response => {
                // remove the deleted job from the jobs list
                setJobs(jobs.filter((job) => job.job_id !== job_id));
            })
            .catch(error => {
                console.error(error);
            });
    };

    const updateJob = (event, job_id) => {
        event.preventDefault();
        // put request to update a job
        axios.put(`/jobs/${job_id}`, editingJob)
            .then(response => {
                // update the updated job in the jobs list
                setJobs(jobs.map(job => job.job_id === job_id ? editingJob : job));
                // reset editingJob state
                setEditingJob(null);
            })
            .catch(error => {
                console.error(error);
            });
    };

    const editJob = (job) => {
        // set the job to be edited
        setEditingJob(job);
    };

    return (
        <div>
            <Navbar />
            <h1>Job Page</h1>
            {/* form to create a new job */}
            <form onSubmit={createJob}>
                <input type="text" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} placeholder="Job title" required />
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
                <input type="text" value={newJob.skills} onChange={e => setNewJob({ ...newJob, skills: e.target.value })} placeholder="Skills" />
                <input type="date" value={newJob.date} onChange={e => setNewJob({ ...newJob, date: e.target.value })} placeholder="Date" />
                <input type="text" value={newJob.notes} onChange={e => setNewJob({ ...newJob, notes: e.target.value })} placeholder="Notes" />
                <button type="submit">Create Job</button>
            </form>
            {/* list of jobs */}
            {jobs.map((job, index) => (
                <div key={index}>
                    <h2>{job.title}</h2>
                    <p>{job.company}</p>
                    <p>{job.location}</p>
                    <p>{job.status}</p>
                    <p>{job.skills}</p>
                    <p>{job.date}</p>
                    <p>{job.notes}</p>
                    <button onClick={() => editJob(job)}>Edit</button>
                    <button onClick={() => deleteJob(job.id)}>Delete</button>
                </div>
            ))}
            {/* form to edit a job */}
            {editingJob && (
                <form onSubmit={(e) => updateJob(e, editingJob.id)}>
                    <input type="text" value={editingJob.title} onChange={e => setEditingJob({ ...editingJob, title: e.target.value })} placeholder="Job title" required />
                    <input type="text" value={editingJob.company} onChange={e => setEditingJob({ ...editingJob, company: e.target.value })} placeholder="Company" required />
                    <input type="text" value={editingJob.location} onChange={e => setEditingJob({ ...editingJob, location: e.target.value })} placeholder="Location" required />
                    <select value={editingJob.status} onChange={e => setEditingJob({ ...editingJob, status: e.target.value })} required>
                        <option value="">--Select Status--</option>
                        <option value="Applied">Applied</option>
                        <option value="Waiting to hear back">Waiting to hear back</option>
                        <option value="Interviewed">Interviewed</option>
                        <option value="Offer Accepted">Offer Accepted</option>
                        <option value="Offer Denied">Offer Denied</option>
                    </select>
                    <input type="text" value={editingJob.skills} onChange={e => setEditingJob({ ...editingJob, skills: e.target.value })} placeholder="Skills" />
                    <input type="date" value={editingJob.date} onChange={e => setEditingJob({ ...editingJob, date: e.target.value })} placeholder="Date" />
                    <input type="text" value={editingJob.notes} onChange={e => setEditingJob({ ...editingJob, notes: e.target.value })} placeholder="Notes" />
                    <button type="submit">Update Job</button>
                </form>
            )}
        </div>
    );
}

export default JobPage;