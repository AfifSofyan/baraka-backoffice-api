import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { RequestBodyMiddleware } from "../../middleware/RequestBodyMiddleware.js";

import { 
    getReportChangeLogs,
} from "../../controller/ReportChangeLogController.js";

export const ReportChangeLogRouteList = [
    new RouteList(apiMethod.GET, "/", getReportChangeLogs, VerifyToken),
]