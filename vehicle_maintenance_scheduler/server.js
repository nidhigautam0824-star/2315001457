const express = require('express');
const app = express();

app.use(express.json());

// ==========================================
// 1. MANDATORY LOGGING MIDDLEWARE
// ==========================================
const customLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} request made to: ${req.url}`);
    if (Object.keys(req.body).length) {
        console.log('Request Body:', JSON.stringify(req.body));
    }
    next();
};
app.use(customLogger);

// In-memory array initialized with their official sample data format
let vehicleLogs = [
    { id: 1, vehicleId: "V101", customerName: "Rohan Sharma", serviceType: "Oil Change", status: "Scheduled", date: "2026-06-15" },
    { id: 2, vehicleId: "V102", customerName: "Amit Verma", serviceType: "Brake Repair", status: "In Progress", date: "2026-06-11" },
    { id: 3, vehicleId: "V103", customerName: "Nisha Singh", serviceType: "General Wash", status: "Completed", date: "2026-06-09" }
];

// ==========================================
// 2. POST /vehicles - Create a Maintenance Log
// ==========================================
app.post('/vehicles', (req, res) => {
    const { vehicleId, customerName, serviceType, status, date } = req.body;

    // Validation rules according to API document specifications
    if (!vehicleId || !customerName || !serviceType || !status || !date) {
        return res.status(400).json({ error: "Missing required fields. All fields are mandatory." });
    }

    const newLog = {
        id: vehicleLogs.length ? vehicleLogs[vehicleLogs.length - 1].id + 1 : 1,
        vehicleId,
        customerName,
        serviceType,
        status,
        date
    };

    vehicleLogs.push(newLog);
    res.status(201).json({ message: "Maintenance log created successfully", log: newLog });
});

// ==========================================
// 3. GET /vehicles - Fetch Logs (With Sort & Filter)
// ==========================================
app.get('/vehicles', (req, res) => {
    let result = [...vehicleLogs];
    const { status, sortBy, order } = req.query;

    // Filtering logic by Status
    if (status) {
        result = result.filter(log => log.status.toLowerCase() === status.toLowerCase());
    }

    // Sorting logic by Date
    if (sortBy === 'date') {
        const sortOrder = order === 'desc' ? -1 : 1;
        result.sort((a, b) => (new Date(a.date) - new Date(b.date)) * sortOrder);
    }

    res.status(200).json(result);
});

// ==========================================
// 4. PUT /vehicles/:id - Update Log Status
// ==========================================
app.put('/vehicles/:id', (req, res) => {
    const logId = parseInt(req.params.id);
    const { status, serviceType, customerName } = req.body;

    const logIndex = vehicleLogs.findIndex(log => log.id === logId);

    if (logIndex === -1) {
        return res.status(404).json({ error: `No record found with ID ${logId}` });
    }

    // Update dynamically if fields are passed
    if (status) vehicleLogs[logIndex].status = status;
    if (serviceType) vehicleLogs[logIndex].serviceType = serviceType;
    if (customerName) vehicleLogs[logIndex].customerName = customerName;

    res.status(200).json({ message: "Record updated successfully", updatedLog: vehicleLogs[logIndex] });
});

// ==========================================
// 5. DELETE /vehicles/:id - Delete Log
// ==========================================
app.delete('/vehicles/:id', (req, res) => {
    const logId = parseInt(req.params.id);
    const logIndex = vehicleLogs.findIndex(log => log.id === logId);

    if (logIndex === -1) {
        return res.status(404).json({ error: `No record found with ID ${logId} to delete.` });
    }

    vehicleLogs.splice(logIndex, 1);
    res.status(200).json({ message: `Maintenance log with ID ${logId} deleted successfully.` });
});

// Server Initialization
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`Vehicle Maintenance API is live on port ${PORT}`);
    console.log(`==================================================`);
});