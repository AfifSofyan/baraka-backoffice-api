import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";

import { getAllCapabilities } from "../../controller/CapabilityController.js";

export const CapabilityRouteList = [
    new RouteList(apiMethod.GET, "/", getAllCapabilities),
]