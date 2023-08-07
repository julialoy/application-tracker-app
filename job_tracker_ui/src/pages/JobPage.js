import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/navbar/Navbar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from 'react-modal';
import './JobPage.css';

Modal.setAppElement(document.getElementById('root'));

function JobPage() {
    const [jobs, setJobs] = useState([]);
    const [skills, setSkills] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [newJob, setNewJob] = useState({
        job_title: '',
        company: '',
        location: '',
        status: '',
        date_applied: '',
        notes: '',
        skills: [],
    });
    const [editingJob, setEditingJob] = useState(null);
    const navigate = useNavigate();

    // fetch jobs from server
    useEffect(() => {
        axios.get('/jobs')
            .then(response => {
                // For each job, fetch its associated skills
                const jobsWithSkillsPromises = response.data.map(job => 
                    axios.get(`/jobs/${job.job_id}/skills`)
                        .then(res => {
                            return { ...job, skills: res.data || []}
                        })
                );
                Promise.all(jobsWithSkillsPromises)
                .then(jobsWithSkills => {
                    setJobs(jobsWithSkills)
                })
                .catch(error => console.error(error));
            })
            .catch(error => {
                console.error(error);
            });
    }, []);
    

    // fetch skills from server
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
        axios.get('/user/firstName')
            .then(response => {
                setFirstName(response.data.firstName);
            })
            .catch(error => console.error(error));
    }, []);
    

    const createJob = async (event) => {
        event.preventDefault();
        // post request to create a new job
        const jobData = {
            ...newJob, 
            skills: newJob.skills.map(skillTitle => {
                const matchedSkill = skills.find(s => s.skill_title === skillTitle);
                return matchedSkill ? matchedSkill.skill_id : null;
            }).filter(skillId => skillId !== null)
        };
        const response = await axios.post('/jobs', jobData);
        if (response.status === 201) {
            setIsAddOpen(false);
            alert("Job added");
            resetJobForm();
            const newJobWithSkills = await axios.get(`/jobs/${response.data.job_id}/skills`)
            .then(res => {
                return { ...response.data, skills: res.data || []}
            })
            setJobs([...jobs, newJobWithSkills]);
        } else {
            setIsAddOpen(false);
            alert("Unable to add job");
            resetJobForm();
        }
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
                setJobs(jobs.map(job => job.job_id === job_id ? {...job, ...editingJob} : job));
                
                // reset editingJob state
                setEditingJob(null);
            })
            .catch(error => {
                console.error("Error from server: ", error);  // log any errors
                console.error(error);
            });
    };

    const editJob = (job) => {
        // set the job to be edited
        setEditingJob(job);
    };

    const resetJobForm = () => {
        setNewJob({ job_title: '', company: '', location: '', status: '', date_applied: '', notes: '' , skills: []});
    };

    const handleOpenAddModal = () => {
        setIsAddOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddOpen(false);
    };

    const handleSkillChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setNewJob({ ...newJob, skills: selectedOptions });
    };

    // Helper function to format date in "MM/DD/YYYY" format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    if (!firstName) { // If firstName is null, user is not logged in
        return (
            <div>
                <Navbar />
                <Header />
                <div className="HomePage">
                <p>You must be logged in to view this page.</p>
                <Link to="/register">Register</Link>
                <br />
                <Link to="/login">Log in</Link>
                </div>
                <Footer />
            </div>
        );
    }
    

    

    return (
        <div>
            <Navbar />
            <h1 className="PageHeader">My Jobs</h1>
            {/* form to create a new job */}
            <div className='JobPage'>
                <button type="button" className="new-job-button"
                        onClick={handleOpenAddModal}>
                    New Job
                </button>
                <Modal
                    className="modal"
                    isOpen={isAddOpen}
                    onRequestClose={handleCloseAddModal}
                    portalClassName={""}
                    shouldCloseOnEsc={true}
                    preventScroll={true}
                >
                <form onSubmit={createJob}>
                    <h2>Track a New Job</h2>
                    <hr /> {/* line */}
                    <p>Enter your new Job/Internship information</p>
                    <input id= 'jobTitle' type="text" value={newJob.job_title} onChange={e => setNewJob({ ...newJob, job_title: e.target.value })} placeholder="Job title" required />
                    <input id= 'jobTitle' type="text" value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} placeholder="Company" required />
                    <input id= 'jobTitle' type="text" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} placeholder="Location" required />
                    <select id= 'jobTitle' value={newJob.status} onChange={e => setNewJob({ ...newJob, status: e.target.value })} required>
                        <option value="">--Select Status--</option>
                        <option value="Applied">Applied</option>
                        <option value="Waiting to hear back">Waiting to hear back</option>
                        <option value="Interviewed">Interviewed</option>
                        <option value="Offer Accepted">Offer Accepted</option>
                        <option value="Offer Denied">Offer Denied</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <select id= 'jobDesc' multiple value={newJob.skills} onChange={handleSkillChange} required>
                        <option value="">--Select Skill--</option>
                        {skills.map((skill, index) => (
                            <option key={index} value={skill.skill_title}>{skill.skill_title}</option>
                        ))}
                    </select>
                    <input id= 'jobTitle' type="date" value={newJob.date_applied} onChange={e => setNewJob({ ...newJob, date_applied: e.target.value })} placeholder="Date" />
                    <input id= 'jobDesc' type="text" value={newJob.notes} onChange={e => setNewJob({ ...newJob, notes: e.target.value })} placeholder="Notes" />
                    <button id="jobSubmit" type="submit">Add Job</button>
                </form>
                </Modal>
                {/* list of jobs */}
                <div>
                        <table id="jobs">
                            <thead>
                            <tr>
                                <th>Job title</th>
                                <th>Company</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Skills</th>
                                <th>Date Applied</th>
                                <th>Notes</th>
                                <th>Edit/Delete</th>
                            </tr>
                            </thead>
                            <tbody>
                            {/*
                            Iterates over the skills objects in skillsList and sends to Skills
                            component to dynamically render each table row.
                            */}
                            {jobs.map((job, index) => {
                                console.log(job);
                            return (
                                <tr key={index}>
                                    <td>{job.job_title}</td>
                                    <td>{job.company}</td>
                                    <td>{job.location}</td>
                                    <td className={`status-${job.status.replace(/\s+/g, '').toLowerCase()}`}>
                                        {job.status}</td>
                                    <td>{
                                        job.skills && job.skills.skills
                                        ? job.skills.skills.map((skill, skillIndex) => (
                                                <span key={skillIndex}>{skill}{skillIndex < job.skills.skills.length - 1 ? ', ' : ''}</span>
                                            ))
                                            : ""
                                        }
                                    </td>
                                    <td>{formatDate(job.date_applied)}</td>
                                    <td className="notes-cell">{job.notes}</td>
                                    <td>
                                        <button className='edit-button' onClick={() => navigate(`/jobs/edit/${job.job_id}`)}>Edit</button>
                                        <button className='delete-button' onClick={() => deleteJob(job.job_id)}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                            </tbody>
                        </table>
                    </div>
            </div>
        </div>
    );
}

export default JobPage;
