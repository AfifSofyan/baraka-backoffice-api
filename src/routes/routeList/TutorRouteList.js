import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { RequestBodyMiddleware } from "../../middleware/RequestBodyMiddleware.js";

import 
{ 
    getAllTutors, 
    createTutor,
    registerTutor,
    updateTutor,
    updateTutorByUserID,
    getTutorDetail,
    getTutorDetailByUserID,
    getTutorIDAndName,
    getTutorIDAndNameWithoutFee,
    getTotalNewRegistrants,
    deleteTutor
} 
from "../../controller/TutorController.js";

export const TutorRouteList = [
    new RouteList(apiMethod.GET, "/", getAllTutors, VerifyToken),
    new RouteList(apiMethod.GET, "/newregistrants", getTotalNewRegistrants, VerifyToken),
    new RouteList(apiMethod.GET, "/simplified", getTutorIDAndName),
    new RouteList(apiMethod.GET, "/withoutfee", getTutorIDAndNameWithoutFee, VerifyToken),
    new RouteList(apiMethod.POST, "/", createTutor, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.POST, "/register", registerTutor),
    new RouteList(apiMethod.PATCH, "/:id", updateTutor, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.PATCH, "/user/:id", updateTutorByUserID, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.GET, "/:id", getTutorDetail, VerifyToken),
    new RouteList(apiMethod.GET, "/user/:id", getTutorDetailByUserID, VerifyToken),
    new RouteList(apiMethod.DELETE, "/:id", deleteTutor, VerifyToken),
]