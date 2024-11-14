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
            header: true, // Use the first row as headers to dynamically map data
            complete: (results) => {
                try {
                    const data = results.data;
                    const formattedComplaints = data.map((row) => {
                        const complaint = {
                            title: row["Complaint"] || "No Title",
                            description: row["Description"] || "No Description",
                            details: [],
                            links: {}
                        };

                        // Loop through each property in the row to classify as a link or detail
                        Object.keys(row).forEach((header) => {
                            const value = row[header];
                            if (header.toLowerCase().includes("folder")) complaint.links.folder = value;
                            else if (header.toLowerCase().includes("complaint")) complaint.links.complaint = value;
                            else if (header.toLowerCase().includes("exhibit")) complaint.links.exhibit = value;
                            else if (header.toLowerCase().includes("trackchanges")) complaint.links.trackChanges = value;
                            else if (header.toLowerCase().includes("sourcedata")) complaint.links.sourceData = value;
                            else if (header.toLowerCase().includes("civilyzer")) complaint.links.civilyzer = value;
                            else if (value && header.toLowerCase() !== "complaint" && header.toLowerCase() !== "description") {
                                // Any other non-empty field is considered a detail
                                complaint.details.push({ label: header, value });
                            }
                        });

                        return complaint;
                    });

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
                            {Object.keys(complaint.links).map((linkType, linkIndex) => (
                                complaint.links[linkType] && (
                                    <li key={linkIndex}>
                                        <a href={complaint.links[linkType]} target="_blank" rel="noopener noreferrer">
                                            {linkType.replace(/([A-Z])/g, ' $1')} Link
                                        </a>
                                    </li>
                                )
                            ))}
                        </ul>
                        <div className="details">
                            {complaint.details.map((detail, detailIndex) => (
                                <p key={detailIndex}><strong>{detail.label}:</strong> {detail.value}</p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
