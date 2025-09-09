import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import moment from 'moment';

dotenv.config();

export const RequestBodyMiddleware = (req, res, next) => {
    const currentTime = moment().format('YYYY-MM-DD hh:mm:ss')
    const userID = req.user ? req.user.id : 0

    req.body.CreatedDate = currentTime
    req.body.CreatedBy = userID
    req.body.UpdatedDate = currentTime
    req.body.UpdatedBy = userID

    next()

};