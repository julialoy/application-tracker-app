// The structure of this page was based on and modified examples from OSU CS290
// as well as from official React documentation
import React from 'react';

export const SkillResult = ({ result }) => {

    return (
        <tr>
            <td>{result.skill_title}</td>
            <td>{result.num_jobs}</td>
            <td>{result.skill_desc}</td>
            <td>{result.percent_jobs}</td>
        </tr>
    );
};

export default SkillResult;