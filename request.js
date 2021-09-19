module.exports = (async (port) => {
    const express = require('express');

    const app = express();

    //Middleware
    app.use(express.json());
    app.use('', (req, res, next) => {
        console.log('start:', Date.now());
        console.group();
        next();

        res.on('finish', () => {
            console.groupEnd();
            console.log('end:', Date.now(), '\n\n');
        });
    }); 

    const { compileModels, loadDynamicRoutes } = require('./loader');
    compileModels();
    app.use('/api', await loadDynamicRoutes());

    //ErrorHandler
    app.use(require('./error/errorHandler'));
    app.use('', (req, res) => {
        console.log('Everything must end');
        res.status(404).json({message: 'Page not found'});
    }); 

    await app.listen(port);
});