module.exports = (async function(port) {
    const express = require('express');
    const addRequestId = require('express-request-id');

    const app = express();

    const rootPath = '/api/';

    //Import Routes
    const prepare = require('./middleware/prepare');
    const auth = require('./routes/auth');
    const user = require('./routes/user');
    const access = require('./routes/access');
    const company = require('./routes/company');
    const module = require('./routes/module');

    //Middleware
    app.use(express.json());
    app.use(addRequestId());
    app.use(rootPath, prepare);

    //Routes
    app.use(`${rootPath}auth`, auth);
    app.use(`${rootPath}user`, user);
    app.use(`${rootPath}access`, access);
    app.use(`${rootPath}company`, company);
    app.use(`${rootPath}module`, module);

    await app.listen(port);
});