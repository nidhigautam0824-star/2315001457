const express = require('express');
const app = express();

const customLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} request made to: ${req.url}`);
    next();
};

module.exports = customLogger;