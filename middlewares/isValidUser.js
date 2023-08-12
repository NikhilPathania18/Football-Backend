import jwt from 'jsonwebtoken'

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