import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { RequestBodyMiddleware } from "../../middleware/RequestBodyMiddleware.js";

import { getDashboardInformation } from "../../controller/DashboardController.js";

export const DashboardRouteList = [
    new RouteList(apiMethod.GET, "", getDashboardInformation, VerifyToken),
]
