import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";

import { getAllProvinces, getCitiesByProvinceID } from "../../controller/LocationController.js";

export const LocationRouteList = [
    new RouteList(apiMethod.GET, "/provinces", getAllProvinces),
    new RouteList(apiMethod.GET, "/cities", getCitiesByProvinceID),
]