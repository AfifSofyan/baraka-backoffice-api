import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";

import { getAllPrograms } from "../../controller/ProgramController.js";

export const ProgramRouteList = [
    new RouteList(apiMethod.GET, "/", getAllPrograms),
]