import React, { useEffect, useState } from 'react';
import UrlShrinker from './UrlShrinker';
import axios from 'axios';

const App = () => {
    const [shortUrls, setShortUrls] = useState([]);

    const getShortUrls = async () => {
        try {
            const response = await axios.get('https://tinyurl-4jgn.onrender.com/');
            setShortUrls(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    getShortUrls();
    useEffect(() => {
    }, [shortUrls]);

    return (
        <div>
            <UrlShrinker shortUrls={shortUrls} />
        </div>
    );
};

export default App;
