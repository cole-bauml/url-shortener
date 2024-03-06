const express = require('express');
const staticRoutes = express.Router();

const path = require('path');

const directory = path.join(__dirname, '..');

staticRoutes.get('/main.css', (req, res) => {
    res.sendFile(directory + '\\client\\css\\main.css')
})

module.exports = {
    staticRoutes
}