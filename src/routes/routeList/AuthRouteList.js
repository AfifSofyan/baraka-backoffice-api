import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { RequestBodyMiddleware } from "../../middleware/RequestBodyMiddleware.js";

import 
{ 
    getVersion,
    authenticateUser,
    isAuthorizedToAccess,
    checkPassword,
    forgetPassword,
    logUserOut,
    getUsernames,
    getEmails,
    updateUser,
    sendVerificationEmail,
    verifyEmail,
    checkEmailVerification
} 
from "../../controller/AuthController.js";

export const AuthRouteList = [
    new RouteList(apiMethod.GET, "/version", getVersion),
    new RouteList(apiMethod.POST, "/login", authenticateUser),
    new RouteList(apiMethod.GET, "/isauthorizedtoaccess", isAuthorizedToAccess, [VerifyToken]),
    new RouteList(apiMethod.POST, "/checkpassword", checkPassword),
    new RouteList(apiMethod.POST, "/forgetpassword", forgetPassword),
    new RouteList(apiMethod.DELETE, "/logout", logUserOut),
    new RouteList(apiMethod.GET, "/usernames", getUsernames),
    new RouteList(apiMethod.GET, "/emails", getEmails),
    new RouteList(apiMethod.GET, "/sendverificationemail", sendVerificationEmail, [VerifyToken]),
    new RouteList(apiMethod.GET, "/verifyemail/:token", verifyEmail),
    new RouteList(apiMethod.PATCH, "/edituser/:id", updateUser, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.GET, "/checkemailverification", checkEmailVerification, [VerifyToken])
]