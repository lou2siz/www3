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

                    // Process each complaint (columns 1-15 per complaint)
                    for (let i = 0; i < data[0].length; i += 15) {
                        formattedComplaints.push({
                            title: data[0][i] || "No Title",
                            description: data[1][i] || "No Description",
                            links: {
                                folder: data[3][i + 1] || "",
                                complaint: data[4][i + 1] || "",
                                exhibit: data[5][i + 1] || "",
                                trackChanges: data[6][i + 1] || "",
                                sourceData: data[7][i + 1] || ""
                            },
                            civilyzer: data[8][i] || "N/A",
                            requestDate: data[9][i] || "N/A",
                            nextRequestDate: data[10][i] || "N/A",
                            whoCalled: data[11][i] || "N/A",
                            spokeTo: data[12][i] || "N/A",
                            when: data[13][i] || "N/A",
                            result: data[14][i] || "N/A"
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
                        <div className="links-section">
                            <h3>Links:</h3>
                            <ul>
                                {complaint.links.folder && <li><a href={complaint.links.folder} target="_blank" rel="noopener noreferrer">File Link (Folder)</a></li>}
                                {complaint.links.complaint && <li><a href={complaint.links.complaint} target="_blank" rel="noopener noreferrer">File Link (C)</a></li>}
                                {complaint.links.exhibit && <li><a href={complaint.links.exhibit} target="_blank" rel="noopener noreferrer">File Link (Exhibit)</a></li>}
                                {complaint.links.trackChanges && <li><a href={complaint.links.trackChanges} target="_blank" rel="noopener noreferrer">File Link (Track Changes)</a></li>}
                                {complaint.links.sourceData && <li><a href={complaint.links.sourceData} target="_blank" rel="noopener noreferrer">File Link (Source Data)</a></li>}
                            </ul>
                        </div>
                        <div className="details-section">
                            <h3>Additional Information:</h3>
                            <p><strong>Civilyzer:</strong> {complaint.civilyzer}</p>
                            <p><strong>Request Date:</strong> {complaint.requestDate}</p>
                            <p><strong>Next Request Date:</strong> {complaint.nextRequestDate}</p>
                            <p><strong>Who Called:</strong> {complaint.whoCalled}</p>
                            <p><strong>Spoke To:</strong> {complaint.spokeTo}</p>
                            <p><strong>When:</strong> {complaint.when}</p>
                            <p><strong>Result:</strong> {complaint.result}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
