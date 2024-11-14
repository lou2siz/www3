import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
    const [complaints, setComplaints] = useState([]);
    const [error, setError] = useState(null);

    // Helper function to check if a string is a valid URL
    const isValidURL = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    useEffect(() => {
        // Load and parse the CSV file
        Papa.parse(`${process.env.PUBLIC_URL}/LawsistViewMetadata.csv`, {
            download: true,
            header: true,
            complete: (results) => {
                try {
                    const data = results.data;
                    const formattedComplaints = [];

                    // Process each complaint by looping through the columns dynamically
                    const complaintCount = Math.floor(Object.keys(data[0]).length / 2); // Assuming pairs of columns

                    for (let i = 0; i < complaintCount; i++) {
                        const complaint = {
                            title: data[0][`Complaint ${i + 1}`] || "No Title",
                            description: data[1][`Complaint ${i + 1}`] || "No Description",
                            links: {}
                        };

                        Object.keys(data[0]).forEach((header) => {
                            if (header.includes(`Complaint ${i + 1}`)) {
                                if (header.toLowerCase().includes("folder")) complaint.links.folder = data[2][header] || "";
                                if (header.toLowerCase().includes("docx")) complaint.links.complaint = data[2][header] || "";
                                if (header.toLowerCase().includes("exhibit")) complaint.links.exhibit = data[2][header] || "";
                                if (header.toLowerCase().includes("trackchanges")) complaint.links.trackChanges = data[2][header] || "";
                                if (header.toLowerCase().includes("sourcedata")) complaint.links.sourceData = data[2][header] || "";
                                if (header.toLowerCase().includes("civilyzer")) complaint.links.civilyzer = data[2][header] || "";
                            }
                        });

                        formattedComplaints.push(complaint);
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
                            {Object.keys(complaint.links).map((linkType, linkIndex) => (
                                <li key={linkIndex}>
                                    {isValidURL(complaint.links[linkType]) ? (
                                        <a href={complaint.links[linkType]} target="_blank" rel="noopener noreferrer">
                                            {linkType.replace(/([A-Z])/g, ' $1')} Link
                                        </a>
                                    ) : (
                                        <span>{linkType.replace(/([A-Z])/g, ' $1')}: {complaint.links[linkType]}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
