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

        if(path.length > 30){
            res.send({
                action: 'create-link',
                type: 'error',
                message: 'Alias can not be more than 30 characters.'
            })
            return; 
        }
        if(url.length > 250){
            res.send({
                action: 'create-link',
                type: 'error',
                message: 'URL can not be longer than 250 characters.'
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

        // Make sure links are valid
        const regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/g
        const shouldProceed = regex.test(url);

        if(!shouldProceed){
            res.send({
                action: 'create-link',
                type: 'error',
                message: 'Enter a valid link.'
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