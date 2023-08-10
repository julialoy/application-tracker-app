import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditPages.css'

export const EditSkillsPage = ({ targetSkill }) => {
    const [editSkillId, setEditSkillId] = useState(targetSkill.skill_id);
    const [editSkillTitle, setEditSkillTitle] = useState(targetSkill.skill_title);
    const [editSkillDesc, setEditSkillDesc] = useState(targetSkill.skill_desc);
    const navigate = useNavigate();

    const resetSkillEditForm = () => {
        setEditSkillTitle('');
        setEditSkillDesc('');
    }

    const handleCancelEdit = () => {
        resetSkillEditForm();
        navigate('/skills');
    }

    const handleSkillsRedirect = (alertText) => {
        alert(alertText);
        navigate('/skills');
    }

    const editSkill = async (evt) => {
        evt.preventDefault();
        const changedSkill = {editSkillTitle, editSkillDesc};
        axios.put(`http://ec2-44-215-13-166.compute-1.amazonaws.com:5000/api/edit-skill/${editSkillId}`, changedSkill, {withCredentials: true})
            .then(response => {
                if (response.status === 201) {
                    handleSkillsRedirect("Skill updated");
                } else {
                    handleSkillsRedirect("Unable to update skill");
                }
            })
            .catch(err => {
                handleSkillsRedirect("Unable to update skill: Internal server error");
                console.error(err);
            });
    }

    return (
        <div className='editpage'>
            <form onSubmit={editSkill}>
                <h2>Edit This Skill</h2>
                <hr /> {/* line */}
                <p>Enter any changes and press 'Save Changes'</p>
                <label htmlFor="editSkillTitle">
                    Skill Title
                </label>
                <input
                    id="editSkillTitle"
                    type="text"
                    name="editSkillTitle"
                    value={editSkillTitle}
                    onChange={evt => setEditSkillTitle(evt.target.value)}
                    required
                />
                <label htmlFor="editSkillDesc">
                    Skill Description
                </label>
                <input
                    id="editSkillDesc"
                    type="text"
                    name="editSkillDesc"
                    value={editSkillDesc}
                    onChange={evt => setEditSkillDesc(evt.target.value)}
                />
                <button id="editSubmit" type="submit">Save Changes</button>
                <button id="cancelEdit" type="button" onClick={handleCancelEdit}>Back to Skills</button>
            </form>
        </div>
    );
}

export default EditSkillsPage;