import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';

function App() {
    const [complaints, setComplaints] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load and parse the CSV file
        Papa.parse(`${process.env.PUBLIC_URL}/LawsistViewMetadata.csv`, {
            download: true,
            header: false,
            complete: (results) => {
                try {
                    const data = results.data;
                    const formattedComplaints = [];

                    // Process each row (each row represents a complaint)
                    for (let i = 0; i < data.length; i += 2) {  // Increment by 2 since data alternates between labels and values
                        if (data[i] && data[i][0]) {  // Check if row exists and has data
                            formattedComplaints.push({
                                title: data[i][0] || "No Title",
                                description: data[i][1] || "No Description",
                                links: {
                                    folder: data[i + 1][3] || "",
                                    complaint: data[i + 1][4] || "",
                                    exhibit: data[i + 1][5] || "",
                                    trackChanges: data[i + 1][6] || "",
                                    sourceData: data[i + 1][7] || ""
                                },
                                civilyzer: data[i + 1][8] || "N/A",
                                requestDate: data[i + 1][9] || "N/A",
                                nextRequestDate: data[i + 1][10] || "N/A",
                                whoCalled: data[i + 1][11] || "N/A",
                                spokeTo: data[i + 1][12] || "N/A",
                                when: data[i + 1][13] || "N/A",
                                result: data[i + 1][14] || "N/A"
                            });
                        }
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
        <Router>
            <Routes>
                <Route path="/" element={<ComplaintGrid complaints={complaints} />} />
                <Route path="/complaint/:id" element={<ComplaintDetail complaints={complaints} />} />
            </Routes>
        </Router>
    );
}

function ComplaintGrid({ complaints }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [sortBy, setSortBy] = useState('date'); // 'date', 'title', etc.

    const filteredComplaints = complaints.filter(complaint => 
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedComplaints = [...filteredComplaints].sort((a, b) => {
        switch(sortBy) {
            case 'date':
                return new Date(b.requestDate) - new Date(a.requestDate);
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    return (
        <div className="App">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="date-filter"
                />
            </div>
            <div className="sort-container">
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                >
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                </select>
            </div>
            <img src={`${process.env.PUBLIC_URL}/Logo.png`} alt="Logo" className="logo" />
            <h1>Lawsist View</h1>
            <div className="complaint-container">
                {sortedComplaints.map((complaint, index) => (
                    <ComplaintCard key={index} complaint={complaint} index={index} />
                ))}
            </div>
        </div>
    );
}

function ComplaintCard({ complaint, index }) {
    const navigate = useNavigate();

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            navigate(`/complaint/${index}`);
        }
    };

    return (
        <div 
            className="complaint-card" 
            tabIndex={0}
            onKeyPress={handleKeyPress}
            role="button"
            aria-label={`View details for complaint ${index + 1}`}
        >
            <Link to={`/complaint/${index}`} className="complaint-title">
                <h2>Complaint {index + 1}</h2>
                <h3>{complaint.title}</h3>
            </Link>
            {/* Rest of your complaint card content */}
        </div>
    );
}

function ComplaintDetail({ complaints }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const complaint = complaints[id];

    if (!complaint) return <div>Complaint not found</div>;

    return (
        <div className="detail-page">
            <button onClick={() => navigate('/')} className="back-button">
                ← Back to Complaints
            </button>
            <div className="detail-container">
                <h1>Complaint {parseInt(id) + 1}</h1>
                <h2>{complaint.title}</h2>
                
                <div className="detail-content">
                    <div className="detail-section">
                        <h3>Description</h3>
                        <p>{complaint.description}</p>
                    </div>

                    <div className="detail-section">
                        <h3>Links</h3>
                        <ul>
                            {Object.entries(complaint.links).map(([key, value]) => (
                                <li key={key}>
                                    <strong>{key}:</strong> <a href={value}>{value}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="detail-section">
                        <h3>Additional Information</h3>
                        <p><strong>Civilyzer:</strong> {complaint.civilyzer}</p>
                        <p><strong>Request Date:</strong> {complaint.requestDate}</p>
                        <p><strong>Next Request Date:</strong> {complaint.nextRequestDate}</p>
                        <p><strong>Who Called:</strong> {complaint.whoCalled}</p>
                        <p><strong>Spoke To:</strong> {complaint.spokeTo}</p>
                        <p><strong>When:</strong> {complaint.when}</p>
                        <p><strong>Result:</strong> {complaint.result}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
