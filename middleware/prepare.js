const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

router.use('', async (req, res, next) => {

    let user;
    try {
        //Verify the token and get the user object
        const token = req.header('authorization')?.split(' ')[1];
        const authData = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        user = await User.findById(authData.userId).select('+refreshTokens').populate('company').exec();
        
        // Check if the JWT has been invalidated
        if (!user.refreshTokens.some(e => e.device === authData.device)) {
            return res.status(403).json({ message: 'The token is invalid.' });
        }
    } catch(err) {
        console.log(err);
    }

    res.locals.user = user;
    
    console.log(req?.id);
    console.group();
    console.log('company:', { _id: user?.company?._id, name: user?.company?.name });
    console.log('user:',  { _id: user?._id, username: user?.username });

    res.once('finish', () => {
        console.groupEnd();
    });

    next();
});

module.exports = router;