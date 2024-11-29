const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Status file path - using environment variable for cloud storage
const STATUS_FILE = process.env.STATUS_FILE_PATH || path.join(__dirname, 'status-updates.json');

// Initialize status file
async function initStatusFile() {
    try {
        await fs.access(STATUS_FILE);
    } catch {
        await fs.writeFile(STATUS_FILE, JSON.stringify({}));
    }
}

// API Routes
app.post('/api/updateStatus', async (req, res) => {
    try {
        const { complaintId, status, note, timestamp } = req.body;
        
        let statusData = {};
        try {
            const data = await fs.readFile(STATUS_FILE, 'utf8');
            statusData = JSON.parse(data);
        } catch (error) {
            console.warn('No existing status file, creating new one');
        }
        
        statusData[complaintId] = {
            status,
            note,
            timestamp,
            history: [
                ...(statusData[complaintId]?.history || []),
                { status, note, timestamp }
            ]
        };
        
        await fs.writeFile(STATUS_FILE, JSON.stringify(statusData, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

app.get('/api/status/:complaintId', async (req, res) => {
    try {
        const data = await fs.readFile(STATUS_FILE, 'utf8');
        const statusData = JSON.parse(data);
        const complaintStatus = statusData[req.params.complaintId] || null;
        res.json(complaintStatus);
    } catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

// Serve React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

initStatusFile().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});