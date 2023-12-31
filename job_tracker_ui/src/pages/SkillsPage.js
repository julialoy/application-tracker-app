import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import axInst from '../axios_instance';
import Navbar from '../components/navbar/Navbar';
import SkillsHeader from '../components/Skills/SkillsHeader';
import Skills from '../components/Skills/Skills';
import SkillSearch from '../components/Skills/SkillSearch';
// import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SkillsPage.css';

// Sets parent element of Modal so screen readers work correctly upon modal open
Modal.setAppElement(document.getElementById('root'));

export const SkillsPage = ({ setTargetSkill }) => {
    const [skillsList, setSkillsList] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newSkillTitle, setNewSkillTitle] = useState('');
    const [newSkillDesc, setNewSkillDesc] = useState('');
    const [firstName, setFirstName] = useState('');
    const navigate = useNavigate();
    

    const onSkillEdit = async (skillId) => {
        const targetSkill = skillsList.filter(skill => skill.skill_id === skillId)[0];
        setTargetSkill(targetSkill);
        navigate('/edit-skill');
    }

    const onSkillDelete = async (skillId) => {
        axInst.delete(`skills/${skillId}`, {withCredentials: true})
            .then(response => {
                if (response.status === 204) {
                    fetchAllSkills();
                } else {
                    alert("Unable to delete skill");
                }
            })
            .catch(err => {
                console.error(err);
                alert("Unable to delete skill: Internal server error");
            });
    }

    // Loading of skills adapted from OSU CS 290 course material and other examples
    // available in the React documentation
    const resetSkillForm = () => {
        setNewSkillTitle('');
        setNewSkillDesc('');
    }

    const handleOpenAddModal = () => {
        setIsAddOpen(true);
    }

    const handleCloseAddModal = () => {
        setIsAddOpen(false);
    }

    const fetchAllSkills = async () => {
        // const response = await fetch('/skills', {method: 'GET', mode: 'cors'});
        // const skillsData = await response.json();
        // setSkillsList(skillsData);
        axInst.get('skills', {withCredentials: true})
            .then(response => {
                setSkillsList(response.data);
            })
            .catch(err => {
                console.error(err);
            });
    }

    const addNewSkill = async (evt) => {
        evt.preventDefault()
        const newSkill = {newSkillTitle, newSkillDesc};
        axInst.post('skills', newSkill, {withCredentials: true})
            .then(response => {
                if (response.status === 201) {
                    setIsAddOpen(false);
                    alert("Skill added");
                    resetSkillForm();
                    fetchAllSkills();
                } else {
                    setIsAddOpen(false);
                    alert("Unable to add skill");
                    resetSkillForm();
                }
            })
            .catch(err => {
                console.error(err);
                alert("Unable to add skill: Internal server error");
                resetSkillForm();
            });
    }

    useEffect(() => {
        fetchAllSkills();
    }, []);

    useEffect(() => {
        axInst.get('user/firstName', {withCredentials: true})
            .then(response => {
                setFirstName(response.data.firstName);
            })
            .catch(error => console.error(error));
    }, []);

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
            <SkillsHeader />
            <div className="SkillsPage">
                <button type="button" className="new-skill-button"
                        onClick={handleOpenAddModal}>
                    New Skill
                </button>
                <Modal
                    className="modal"
                    isOpen={isAddOpen}
                    onRequestClose={handleCloseAddModal}
                    portalClassName={""}
                    shouldCloseOnEsc={true}
                    preventScroll={true}
                >
                    <form onSubmit={addNewSkill}>
                        <h2>Add a New Skill</h2>
                        <hr /> {/* line */}
                        <p>Enter your new Skill and a Description</p>
                        <label htmlFor="skillTitle">
                            Skill Title
                        </label>
                        <input
                            id="skillTitle"
                            type="text"
                            name="newSkillTitle"
                            placeholder="Skill title"
                            value={newSkillTitle}
                            onChange={evt => setNewSkillTitle(evt.target.value)}
                            required
                        />
                        <label htmlFor="skillDesc">
                            Skill Description
                        </label>
                        <input
                            id="skillDesc"
                            type="text"
                            name="newSkillDesc"
                            placeholder="Skill Description"
                            value={newSkillDesc}
                            onChange={evt => setNewSkillDesc(evt.target.value)}
                        />
                        <button id="skillSubmit" type="submit">Add Skill</button>
                    </form>
                </Modal>
                <div>
                    <SkillSearch />
                    <table id="skills">
                        <thead>
                        <tr>
                            <th>Skill</th>
                            <th># of Jobs</th>
                            <th>Details</th>
                            <th>Edit/Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/*
                        Iterates over the skills objects in skillsList and sends to Skills
                        component to dynamically render each table row.
                        */}
                            { skillsList.map((skill, i) => <Skills skill={skill}
                                                                key={'skill-' + i.toString()}
                                                                onSkillEdit={onSkillEdit}
                                                                onSkillDelete={onSkillDelete}
                            />)}
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    )
}

export default SkillsPage;