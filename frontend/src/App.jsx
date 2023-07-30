import React, { useEffect, useState } from 'react';
import UrlShrinker from './UrlShrinker';
import axios from 'axios';

const App = () => {
  const [shortUrls, setShortUrls] = useState([]);

  useEffect(() => {
    const getShortUrls = async () => {
      try {
        const response = await axios.get('http://localhost:3000/');
        setShortUrls(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    getShortUrls();
  }, [shortUrls]);

  return (
    <div>
      {shortUrls.length >0 ? (
        <UrlShrinker shortUrls={shortUrls} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default App;
