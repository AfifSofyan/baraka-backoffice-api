import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { RequestBodyMiddleware } from "../../middleware/RequestBodyMiddleware.js";

import { 
    getPresence,
    createPresenceScheduleNote,
    updatePresenceScheduleNote,
    deletePresenceScheduleNote,
    createPresenceReportNote,
    updatePresenceReportNote,
    deletePresenceReportNote
} from "../../controller/PresenceController.js";

export const PresenceRouteList = [
    new RouteList(apiMethod.GET, "/", getPresence, VerifyToken),
    new RouteList(apiMethod.POST, "/schedulenote", createPresenceScheduleNote, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.PATCH, "/schedulenote/:id", updatePresenceScheduleNote, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.DELETE, "/schedulenote/:id", deletePresenceScheduleNote, VerifyToken),
    new RouteList(apiMethod.POST, "/reportnote", createPresenceReportNote, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.PATCH, "/reportnote/:id", updatePresenceReportNote, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.DELETE, "/reportnote/:id", deletePresenceReportNote, VerifyToken)
]