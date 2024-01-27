import jwt from 'jsonwebtoken'
import user from '../models/user.js';

export const isValidUser = async(req,res,next) => {
    try {
        const token = req.headers.Authorization;

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        if(decoded) next();
    } catch (error) {
        return res.status(402).send({
            success: false,
            message: 'Unauthorized User'
        })
    }
}

export const isScorer = async(req,res,next) => {
    try {
        const token = req.headers.Authorization;

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(decoded){
            next();
        }
    } catch (error) {
        return res.status(402).send({
            success: false,
            message: 'Unauthorized User'
        })
    }
}