import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';

function App() {
    const [complaints, setComplaints] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Attempting to load CSV file...");
        Papa.parse(`${process.env.PUBLIC_URL}/LawsistViewMetadata.csv`, {
            download: true,
            header: false,
            complete: (results) => {
                try {
                    const data = results.data;
                    const formattedComplaints = [];
                    
                    // Number of columns per complaint
                    const columnsPerComplaint = 2;
                    // Total number of complaints
                    const numberOfComplaints = 5;

                    // Process each complaint
                    for (let complaintIndex = 0; complaintIndex < numberOfComplaints; complaintIndex++) {
                        const baseColumn = complaintIndex * columnsPerComplaint;
                        
                        formattedComplaints.push({
                            title: data[1][baseColumn] || "No Title",
                            description: data[2][baseColumn] || "No Description",
                            links: {
                                folder: data[3][baseColumn + 1] || "",
                                complaint: data[4][baseColumn + 1] || "",
                                exhibit: data[5][baseColumn + 1] || "",
                                trackChanges: data[6][baseColumn + 1] || "",
                                sourceData: data[7][baseColumn + 1] || ""
                            },
                            civilyzer: data[8][baseColumn + 1] || "N/A",
                            requestDate: data[9][baseColumn + 1] || "N/A",
                            nextRequestDate: data[10][baseColumn + 1] || "N/A",
                            whoCalled: data[11][baseColumn + 1] || "N/A",
                            spokeTo: data[12][baseColumn + 1] || "N/A",
                            when: data[13][baseColumn + 1] || "N/A",
                            result: data[14][baseColumn + 1] || "N/A"
                        });
                    }

                    console.log("Formatted Complaints:", formattedComplaints);
                    setComplaints(formattedComplaints);
                    setLoading(false);
                } catch (err) {
                    console.error("Error parsing CSV:", err);
                    setError(`Failed to parse CSV: ${err.message}`);
                    setLoading(false);
                }
            },
            error: (error) => {
                console.error("Papa Parse Error:", error);
                setError(`Failed to load CSV: ${error.message}`);
                setLoading(false);
            }
        });
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading complaints...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error Loading Data</h2>
                <p>{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="retry-button"
                >
                    Retry
                </button>
            </div>
        );
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
