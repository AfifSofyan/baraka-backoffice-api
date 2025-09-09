import AuthService from "../services/AuthService.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";
import pkg from '../../package.json' assert { type: 'json' };


export const getVersion = async (req, res) => {
    res.json({
        message: "This is an api project for barakaeducation.com",
        version: pkg.version
    })
};

export const authenticateUser = async (req, res) => {
    try {

        const result = await AuthService.authenticateUser(req);

        res.cookie('authorization', result.token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

        res.json({
            message: "You Have Been Logged In Successfully",
            data: {
                ...result
            }
        })
        
    } catch (error) {
        HandleError(error, res);
    }    
};

export const isAuthorizedToAccess = async (req, res) => {
    const roleID = req.user.roleID
    const menuName = req.query.menuName

    try {

        const isVerified = await AuthService.isAuthorizedToAccess(roleID, menuName);

        if(isVerified){
            res.json({
                isAuthorized: true,
                message: `You are authorized to access ${req.query.menuName} feature`,
            })
        }
        
    } catch (error) {
        HandleError(error, res);
    }  
}

export const checkPassword = async (req, res) => {
    try {
        const result = await AuthService.checkPassword(req)

        res.json(result)
    } catch (error) {
        HandleError(error, res)
    }
}

export const forgetPassword = async (req, res) => {
    try {
        const result = await AuthService.forgetPassword(req)

        res.json(result)
    } catch (error) {
        HandleError(error, res)
    }
}

export const logUserOut = async (req, res) => {
    try {

        res.clearCookie('authorization');

        res.json({
            message: "You Have Been Logged Out Successfully",
        })

        
    } catch (error) {
        HandleError(error, res);
    }  
};

export const getUsernames = async (req, res) => {
    try  {
        const data = await AuthService.getUsernames();

        res.json({
            message: "Get Usernames Successfully",
            data: data
        })
    } catch(error) {
        HandleError(error, res);
    }
};

export const getEmails = async (req, res) => {
    try  {
        const data = await AuthService.getEmails();

        res.json({
            message: "Get Emails Successfully",
            data: data
        })
    } catch(error) {
        HandleError(error, res)
    }
};

export const updateUser = async (req, res) => {
    try {
        const body = req.body
        const id = req.params['id']
        
        const data = await AuthService.updateUser(body, id)

        res.json(data)
    } catch(error) {
        HandleError(error, res)
    }
};

export const sendVerificationEmail = async (req, res) => {
    try {
        const data = await AuthService.sendVerificationEmail(req)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
};

export const verifyEmail = async (req, res) => {
    try {
        await AuthService.verifyEmail(req, res)
    } catch (error) {
        HandleError(error, res)
    }
};

export const checkEmailVerification = async (req, res) => {
    try {
        const data = await AuthService.checkEmailVerification(req.user.id)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}