import React, { useState } from 'react';
import SkillResult from './SkillResult';

export const SkillSearch = () => {
    const [skillName, setSkillName] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSkillSearch = async (evt) => {
        evt.preventDefault();
        const skillToSearch = {skillName};
        const results = await fetch('/search-skill', {
            method: 'POST',
            body: JSON.stringify(skillToSearch),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (results.status === 201) {
            const jsonResults = await results.json();
            setSearchResults(jsonResults);
        } else {
            setSearchResults([]);
        }
    }

    return (
        <div>
            <form onSubmit={handleSkillSearch}>
                <input id="skillTitleSearch"
                       type="text"
                       value={skillName}
                       onChange={evt => setSkillName(evt.target.value)}
                />
                <button id="skillSearchBtn" type="submit">Search</button>
            </form>
            { searchResults.length > 0 ?
                <div id="searchResults">
                    <table id="searchResultTab">
                    <thead>
                        <th>Skill</th>
                        <th># of Jobs</th>
                        <th>Details</th>
                        <th>% Jobs with Skill</th>
                    </thead>
                    <tbody>
                        { searchResults
                            .map((result, i) => <SkillResult
                                result={result}
                                key={'result-' + i.toString()}
                            />)}
                    </tbody>
                    </table>
                    <br />
                </div>
                : ''
            }
        </div>
    );
}

export default SkillSearch;