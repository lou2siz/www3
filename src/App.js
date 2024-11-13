import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
    const [complaints, setComplaints] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load and parse the CSV file
        Papa.parse(`${process.env.PUBLIC_URL}/LawsistViewMetadata.csv`, {
            download: true,
            header: false, // Set to false if your CSV has no header row
            complete: (results) => {
                try {
                    const data = results.data;
                    const formattedComplaints = [];

                    // Process each odd/even column pair to create a complaint card
                    for (let i = 0; i < data[0].length; i += 2) {
                        formattedComplaints.push({
                            title: data[0][i] || "No Title",       // Complaint title
                            description: data[1][i] || "No Description", // Complaint description
                            links: {
                                folder: data[3][i + 1] || "",      // Full Folder link
                                docx: data[4][i + 1] || "",        // Complaint docx link
                                exhibit: data[5][i + 1] || "",     // Exhibit A link
                                trackChanges: data[6][i + 1] || "",// Track Changes link
                                sourceData: data[7][i + 1] || ""   // Source Data link
                            }
                        });
                    }

                    setComplaints(formattedComplaints);
                } catch (err) {
                    console.error("Error parsing CSV:", err);
                    setError("Failed to load complaints data.");
                }
            },
            error: (err) => {
                console.error("Error loading CSV:", err);
                setError("Failed to load CSV file.");
            }
        });
    }, []);

    if (error) {
        return <div className="App"><h1>{error}</h1></div>;
    }

    return (
        <div className="App">
            <img src={`${process.env.PUBLIC_URL}/Logo.png`} alt="Logo" className="logo" />
            <h1>Lawsist View</h1>
            <div className="complaint-container">
                {complaints.map((complaint, index) => (
                    <div className="complaint-card" key={index}>
                        <h2>{complaint.title}</h2>
                        <p>{complaint.description}</p>
                        <ul>
                            {complaint.links.folder && <li><a href={complaint.links.folder} target="_blank" rel="noopener noreferrer">File Link (Folder)</a></li>}
                            {complaint.links.docx && <li><a href={complaint.links.docx} target="_blank" rel="noopener noreferrer">File Link (Docx)</a></li>}
                            {complaint.links.exhibit && <li><a href={complaint.links.exhibit} target="_blank" rel="noopener noreferrer">File Link (Exhibit)</a></li>}
                            {complaint.links.trackChanges && <li><a href={complaint.links.trackChanges} target="_blank" rel="noopener noreferrer">File Link (Track Changes)</a></li>}
                            {complaint.links.sourceData && <li><a href={complaint.links.sourceData} target="_blank" rel="noopener noreferrer">File Link (Source Data)</a></li>}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
