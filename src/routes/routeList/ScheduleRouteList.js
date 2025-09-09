import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { RequestBodyMiddleware } from "../../middleware/RequestBodyMiddleware.js";

import { 
    getSchedules,
    getScheduleDetail,
    createSchedule,
    updateSchedule,
    deleteSchedule
} from "../../controller/ScheduleController.js";

export const ScheduleRouteList = [
    new RouteList(apiMethod.GET, "/", getSchedules, VerifyToken),
    new RouteList(apiMethod.GET, "/:id", getScheduleDetail, VerifyToken),
    new RouteList(apiMethod.POST, "/", createSchedule, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.PATCH, "/:id", updateSchedule, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.DELETE, "/:id", deleteSchedule, VerifyToken),
]