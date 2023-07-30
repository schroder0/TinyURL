import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const UrlShrinker = ({ shortUrls }) => {
    const [fullUrl, setFullUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/shortUrls', { fullUrl });
            // Handle the response or update the state as needed
            console.log(response.data);
            
        } catch (error) {
            // Handle error if any
            console.error(error);
        }
    };
    
    return (
        <div className="container">
            <h1>URL Shrinker</h1>
            <form onSubmit={handleSubmit} className="my-4 form-inline">
                <label htmlFor="fullUrl" className="sr-only">Url</label>
                <input
                    required
                    placeholder="Url"
                    type="url"
                    name="fullUrl"
                    id="fullUrl"
                    className="form-control col mr-2"
                    value={fullUrl}
                    onChange={(e) => setFullUrl(e.target.value)}
                />
                <button className="btn btn-success" type="submit">Shrink</button>
            </form>

            <table className="table table-striped table-responsive">
                <thead>
                    <tr>
                        <th>Full URL</th>
                        <th>Short URL</th>
                        <th>Clicks</th>
                    </tr>
                </thead>
                <tbody>
                    {shortUrls.map(shortUrl => (
                        <tr key={shortUrl._id}>
                            <td><a href={shortUrl.full}>{shortUrl.full}</a></td>
                            <td><a href={`http://localhost:3000/${shortUrl.short}`}>{shortUrl.short}</a></td>
                            <td>{shortUrl.clicks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UrlShrinker;
