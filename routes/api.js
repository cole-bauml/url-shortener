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
    const timestamp = new Date().toISOString();
    const path = req.path.replace(/^\//, '');

    // gather console text
    const logText =
`---- LINK PAGE DEBUG ----
Time: ${timestamp}
Method: ${req.method}
Path: ${req.path}
Full URL: ${req.originalUrl}
Body: ${JSON.stringify(req.body, null, 2)}
Headers: ${JSON.stringify(req.headers, null, 2)}
--------------------------`;

    console.log(logText);

    // send same info to Discord
    const webhookURL = process.env.DISCORD_WEBHOOK;
    if (webhookURL) {
      await fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Discord has a 2000-character limit per message
          content: `LINK CLICK!!!\`\`\`\n${logText.slice(0, 1900)}\n\`\`\``
        })
      });
    }

    // Only handle GET requests normally
    if (req.method !== "GET") {
      console.warn(`[linkPage] Non-GET request intercepted: ${req.method} ${req.originalUrl}`);
      return res.status(405).json({
        action: "get-link",
        type: "error",
        message: `linkPage received a ${req.method} request instead of GET`,
        debug: { method: req.method, url: req.originalUrl, path: req.path, body: req.body }
      });
    }

    const result = await URLModel.find({ alias: path });

    if (result.length > 0) {
      console.log(`[linkPage] Redirecting ${path} → ${result[0].URL}`);
      res.redirect(result[0].URL);
    } else {
      console.warn(`[linkPage] Unknown path: ${path}`);
      res.render("unknown");
    }
  } catch (err) {
    console.error("[linkPage] ERROR:", err);
    res.status(500).json({
      action: "get-link",
      type: "error",
      message: "Error getting link: " + err.message
    });
  }
}


module.exports = {
    apiRoutes,
    linkPage
}
