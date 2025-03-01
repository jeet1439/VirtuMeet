import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    console.log(req.cookies.access_token);
    const token = req.cookies.access_token;
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized 1' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized here' });
        }
        req.user = user;
        next();
    });
};