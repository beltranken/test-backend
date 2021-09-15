const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getErrorMsg } = require('../common');

const User = require('../models/user');

const router = express.Router();

const expiresIn = 24 * 60 * 60000;

router.post('/token', async (req, res) => {
    try {
        const refreshToken = req.body?.token;

        if (!refreshToken) return res.status(422).json({ message: 'Invalid token 1' });

        const user = await User.findOne({ refreshTokens:{ $elemMatch: { token: refreshToken }}}).select('+refreshTokens +password');
        if (!user) return res.status(403).json({ message: 'Invalid token 2' });

        const i = user.refreshTokens.findIndex(e => e.token === refreshToken);

        await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET + user.password + user.refreshTokens[i].device);
        const accessToken = generateAccessToken({ userId: user._id, device:  user.refreshTokens[i].device});

        user.refreshTokens[i].lastUsed = Date.now();
        await user.save();

        res.json({ accessToken: accessToken, expiresIn: Date.now() + expiresIn });
    } catch(err) {
        res.status(403).json({ message: 'Invalid token 3' });
    }
});

router.post('/login', async (req, res) => {
    try {
        if(res.locals?.user)  return res.status(400).json({ message: 'Already logged in' });

        const { username, password, device } = req.body;
        const company = req.body?.company;

        const user = await User.findOne({ username: username, company: company }).select('+password +refreshTokens');
        if (!user) return res.status(400).json({ message: 'Username or Password is incorrect 1' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Username or Password is incorrect 2' });

        const payload = { userId: user._id, device: device };
        const accessToken = generateAccessToken(payload);
        
        const refreshTokenPayload = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET + user.password + device);
        user.lastLogin = Date.now();
        user.refreshTokens = user.refreshTokens?.filter(token => token.device !== device);
        user.refreshTokens.push({ token: refreshTokenPayload, device: device });
        
        await user.save({ timestamps: false });

        res.status(200).json({ accessToken: accessToken, refreshToken: refreshTokenPayload, expiresIn: Date.now() + expiresIn });
    } catch (err) {
        const ret = getErrorMsg(err);
        res.status(ret.code).json(ret.message);
    }
});

router.post('/logout', async (req, res) => {
    try {
        const token = req.body?.token;
        const user = res.locals.user;
        
        if (!token) return res.status(401).json({ message: 'Invalid token.' });

        await User.findByIdAndUpdate(
            user?._id,
            { $pull: { refreshTokens : { token: token }}}
        );
        
        res.json({message: 'Successful'});
    } catch(err) {
        const ret = getErrorMsg(err);
        res.status(ret.code).json(ret.message);
    }
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiresIn + 'm' });
}

module.exports = router;