import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { HandleError } from "../utils/errors/ErrorHandling.js";
import NotAuthorized from "../utils/errors/NotAuthorized.js";
import Forbidden from "../utils/errors/Forbidden.js";


dotenv.config();

export const VerifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    try{
        if (token) {
            jwt.verify(token, process.env.AUTHENTICATION_KEY, (err, decoded) => {
                if (err) {
                    throw new Forbidden();
                }
                req.user = decoded;
                next();
            });
        } else {
            throw new NotAuthorized();
        }
    }catch(error){
        HandleError(error, res);
    }
};