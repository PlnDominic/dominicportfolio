const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the arkon.digital directory
app.use(express.static(path.join(__dirname, 'arkon.digital')));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'arkon.digital', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
