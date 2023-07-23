// The structure of this page was based on and modified examples from OSU CS290
// as well as from official React documentation
import React from 'react';

export const Skills = ({ skill, onSkillDelete }) => {

    return (
        <tr>
            <td>{skill.skill_title}</td>
            <td>TBA</td>
            <td>{skill.skill_desc}</td>
            <td>
                <button type="button">Edit</button>
                <button type="button" onClick={() => onSkillDelete(skill.skill_id)}>Delete</button>
            </td>
        </tr>
    );
};

export default Skills;