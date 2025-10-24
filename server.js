require('dotenv').config();
const path = require("node:path");

const express = require('express');
const app = express();

// var session = require('express-session')
// var MongoDBStore = require('connect-mongodb-session')(session);
// var store = new MongoDBStore({
//     uri: `mongodb://127.0.0.1:27017/${process.env.databaseName}`,
//     collection: 'sessions'
// });

// store.on('error', function(error) {
//     console.log(`Can't connect to database session store. Error: ${error}`);
//     return;
// });

// // Unimplimented Sessions
// app.use(session({
//     secret: process.env.sessionSecret, // Random string
//     resave: false,
//     saveUninitialized: false, // Don't create a cookie before a value is attempted to be set.
//     cookie: {
//         maxAge: 864000000 // Ten days before automatic session delete and sign out
//     },
//     store: store
// }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
    // Keep the leading slash, but collapse any others (e.g., // → /)
    req.url = req.url.replace(/([^:]\/)\/+/g, '$1');

    // Don't remove trailing slash if the URL is just "/"
    if (req.url.length > 1 && req.url.endsWith('/')) {
        // Keep the trailing slash if it's meaningful (like for linkPage URLs)
        // Only remove it if there's nothing after it (e.g. `/assignment-submissions/`)
        req.url = req.url.replace(/\/+$/, '');
    }

    next();
});

console.log(__dirname)

const { main } = require('./database.js');
main();

app.set("views", path.join(__dirname, "client"));
app.set('view engine', 'ejs')

const { homeRoutes } = require('./routes/home.js')
app.use(homeRoutes)
const { apiRoutes, linkPage } = require('./routes/api.js')
app.use(apiRoutes)
const { staticRoutes } = require('./routes/static.js');
app.use(staticRoutes)

app.use(linkPage)

app.listen(process.env.port, () => {
    console.log("App listening on port: " + process.env.port)
})
