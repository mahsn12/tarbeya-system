import React, { useState } from 'react';
import axios from 'axios';
import { teamsApi } from '../services/api';

const SearchInquiry = () => {
    const [nationalId, setNationalId] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/search/${nationalId}`);
            const resData = response.data;
            // If server didn't include team members, try to fetch team details from teams API
            if (resData.teamCode && (!resData.teamMembers || resData.teamMembers.length === 0)) {
                try {
                    const teamRes = await teamsApi.getByCode(resData.teamCode);
                    const team = teamRes.data;
                    resData.teamMembers = team.student_names || team.national_ids || [];
                    resData.teamResearch = (team.research_topics || []).join(', ');
                } catch (err) {
                    // ignore
                }
            }

            setData(resData);
            setError('');
        } catch (err) {
            setError('National ID not found.');
            setData(null);
        }
    };

    return (
        <div>
            <input 
                type="text" 
                value={nationalId} 
                onChange={(e) => setNationalId(e.target.value)} 
                placeholder="Enter National ID" 
            />
            <button onClick={handleSearch}>Search</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {data && (
                <div style={{ border: '1px solid black', padding: '10px', marginTop: '10px' }}>
                    <h3>Name: {data.name}</h3>
                    <p>Serial Number: {data.serialNumber}</p>
                    <p>Search Result: {data.searchResult}</p>
                    {data.teamCode && <p>Team Code: {data.teamCode}</p>}
                    {data.teamMembers && data.teamMembers.length > 0 && (
                        <p>Team Members: {data.teamMembers.join(', ')}</p>
                    )}
                    {data.teamResearch && <p>Team Research: {data.teamResearch}</p>}
                </div>
            )}
        </div>
    );
};

export default SearchInquiry;