( async function () {
    'use strict';
    
    const request = require('./request');
    const { connect } = require('./db');
    const dotenv = require('dotenv');

    dotenv.config();

    console.log(Date.now(), 'The app is starting');

    //Connect to DB
    console.log(Date.now(), 'The app is connecting to db');
    await connect();
    console.log(Date.now(), 'The app is now connected to db');

    console.log(Date.now(), 'The configuring the end points');
    await request(process.env.NODE_PORT || 3000);
    console.log(Date.now(), 'The app is now listening');
    
    console.log(Date.now(), 'The app is now running');

})().then().catch(e => console.log(e));