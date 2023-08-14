import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios';
import axInst from '../axios_instance';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/navbar/Navbar';
import './HomePage.css'

export const HomePage = () => {
    const [jobs, setJobs] = useState([]);
    const [firstName, setFirstName] = useState('');
    const [skills, setSkills] = useState([]);
    const [contacts, setContacts] = useState([]);
    
    useEffect(() => {
        axInst.get('user/firstName', {withCredentials: true})
            .then(response => {
                setFirstName(response.data.firstName);
            })
            .catch(error => console.error(error));
        axInst.get('contacts', {withCredentials: true})
        .then(response => {
            setContacts(response.data);
        })
        .catch(error => console.error(error));
        axInst.get('jobs', {withCredentials: true})
            .then(response => {
                const jobsWithSkillsPromises = response.data.map(job =>
                    axInst.get(`jobs/${job.job_id}/skills`, {withCredentials: true})
                        .then(res => {
                            return { ...job, skills: res.data || [] }
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
        axInst.get('skills', {withCredentials: true})
        .then(response => {
            console.log(response.data)
            setSkills(response.data);
        })
        .catch(error => console.error(error));
    }, []);
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    if (!firstName) { // If firstName is null, user is not logged in
        return (
            <div >
                <Navbar />
                <Header />
                <div className='HomePage'>
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
            <Header />
            <div  className='HomePage'>
                <h3>{firstName}'s Recent Jobs</h3> 
                    <table id="jobs">
                        <thead>
                            <tr>
                                <th>Job title</th>
                                <th>Company</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Date Applied</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.slice(-4).map((job, index) => ( 
                                <tr key={index}>
                                    <td>{job.job_title}</td>
                                    <td>{job.company}</td>
                                    <td>{job.location}</td>
                                    <td className={`status-${job.status.replace(/\s+/g, '').toLowerCase()}`}>
                                        {job.status}</td>
                                    <td>{formatDate(job.date_applied)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className='ViewMore'><Link to="/jobs">View more jobs...</Link></button> 
                </div>
                <div  className='HomePage'>
                    <h3>{firstName}'s Top Skills</h3>
                    <table id="skills">
                        <thead>
                            <tr>
                                <th>Skill</th>
                                <th># of Jobs</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {skills.slice(-4).map((skill, index) => (
                                <tr key={index}>
                                    <td>{skill.skill_title}</td>
                                    <td>{skill.num_jobs}</td>
                                    <td className='notes-cell'>{skill.skill_desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className='ViewMore'><Link to="/skills">View more skills...</Link></button>
                </div>
                <div className='HomePage'>
                    <h3>{firstName}'s Recent Contacts</h3>
                    <table id="contacts">
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last name</th>
                                <th>Email</th>
                                <th>Company</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.slice(-4).map((contact, index) => ( 
                                <tr key={index}>
                                    <td>{contact.first_name}</td>
                                    <td>{contact.last_name}</td>
                                    <td>{contact.email}</td>
                                    <td>{contact.company}</td>
                                    <td className='notes-cell'>{contact.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className='ViewMore'><Link to="/contacts">View more contacts...</Link></button>
                </div>
                <Footer />
            </div>
    );
}

export default HomePage;