import React, { useEffect, useState } from 'react';
import Skills from '../components/Skills';
import Navbar from '../components/navbar/Navbar';
import SkillsHeader from '../components/SkillsHeader';


export const SkillsPage = ({ }) => {
    const [skillsList, setSkillsList] = useState([]);
    const [newSkillTitle, setNewSkillTitle] = useState('');
    const [newSkillDesc, setNewSkillDesc] = useState('');

    // const onSkillEdit = async () => {
    //     pass;
    // }

    const onSkillDelete = async (skillId) => {
        const response = await fetch(`/skills/${skillId}`, {method: 'DELETE'});
        if (response.status === 204) {
            alert("SKill deleted");
            fetchAllSkills();
        } else {
            alert("Unable to delete skill");
        }
    }

    // Loading of skills adapted from OSU CS 290 course material and other examples
    // available in the React documentation
    const resetSkillForm = () => {
        setNewSkillTitle('');
        setNewSkillDesc('');
    }

    const fetchAllSkills = async () => {
        const response = await fetch('/skills', {method: 'GET'});
        const skillsData = await response.json();
        setSkillsList(skillsData);
    }

    const addNewSkill = async (evt) => {
        evt.preventDefault()
        const newSkill = {newSkillTitle, newSkillDesc};
        const response = await fetch('/skills', {
            method: 'POST',
            body: JSON.stringify(newSkill),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status === 201) {
            alert("Skill added");
            resetSkillForm();
            fetchAllSkills();
        } else {
            alert("Unable to add skill");
            resetSkillForm();
        }
    }

    useEffect(() => {
        fetchAllSkills();
    }, []);

    return (
        <div>
            <Navbar />
            <SkillsHeader />
            <form onSubmit={addNewSkill}>
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
            <br />
            <div>
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
                                                               // onSkillEdit={onSkillEdit(skill[0])}
                                                               onSkillDelete={onSkillDelete}
                        />)}
                    </tbody>
                </table>

            </div>
        </div>
    )
}

export default SkillsPage;