import React, { useState } from 'react';
// import axios from 'axios';
import axInst from '../../axios_instance';
import SkillResult from './SkillResult';

export const SkillSearch = () => {
    const [skillName, setSkillName] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleClearSearch = () => {
        setSkillName('');
        setSearchResults([]);
    }

    const handleSkillSearch = async (evt) => {
        evt.preventDefault();
        const skillToSearch = {skillName};
        axInst.post(
            `search-skill`,
            skillToSearch,
            {withCredentials: true})
            .then(response => {
                if (response.status === 201) {
                    setSearchResults(response.data);
                } else {
                    setSearchResults([]);
                }
            })
            .catch(err => {
                console.error(err);
                setSearchResults([]);
            });
    }

    return (
        <div>
            <form onSubmit={handleSkillSearch}>
                <input id="skillTitleSearch"
                       type="text"
                       value={skillName}
                       onChange={evt => setSkillName(evt.target.value)}
                />
                <div>
                    <button id="skillSearchBtn" type="submit">Search</button>
                    <button id="clearSearch" type="button" onClick={handleClearSearch}>Clear</button>
                </div>
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