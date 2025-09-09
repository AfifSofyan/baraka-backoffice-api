import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { RequestBodyMiddleware } from "../../middleware/RequestBodyMiddleware.js";

import { 
    getResponse,
    createReport,
    getReportDetail,
    updateReport,
    deleteReport,
    getNotesSimilarityChecking
} from "../../controller/ResponseController.js";

export const ResponseRouteList = [
    new RouteList(apiMethod.GET, "/", getResponse, VerifyToken),
    new RouteList(apiMethod.GET, "/similaritychecking", getNotesSimilarityChecking, VerifyToken),
    new RouteList(apiMethod.POST, "/", createReport, RequestBodyMiddleware),
    new RouteList(apiMethod.PATCH, "/:id", updateReport, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.GET, "/:id", getReportDetail, VerifyToken),
    new RouteList(apiMethod.DELETE, "/:id", deleteReport, [VerifyToken, RequestBodyMiddleware])
]