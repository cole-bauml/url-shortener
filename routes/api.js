const express = require('express')
const apiRoutes = express.Router();
const { URLModel } = require('../database.js')

apiRoutes.post('/create-link', async (req, res) => {
    try {


        const { url, path } = req.body;

        if (!url || !path) {
            res.send({
                action: 'create-link',
                type: 'error',
                message: 'Please fill out all fields.'
            })
            return;
        }


        const results = await URLModel.find({ alias: `/${path}` });
        if (results.length > 0) {
            res.send({
                action: 'create-link',
                type: 'error',
                message: 'Alias already in use.'
            })
            return;
        }

        const link = new URLModel({
            alias: '/' + path,
            URL: url
        })
        link.save().then(() => {
            res.send({
                action: 'create-link',
                type: 'success',
                message: 'Successfully created link.'
            })
        });


    } catch (err) {
        res.send({
            action: 'create-link',
            type: 'error',
            message: 'Error creating link: ' + err
        })
    }

})

async function linkPage(req, res) {
    try {
        const path = req.path;
        const result = await URLModel.find({ alias: path });
        if (result.length > 0) {
            res.redirect(result[0].URL)
        }
        else {
            res.render('unknown')
        }

    } catch (err) {
        res.send({
            action: 'get-link',
            type: 'error',
            message: 'Error getting link: ' + err
        })
    }
}

module.exports = {
    apiRoutes,
    linkPage
}