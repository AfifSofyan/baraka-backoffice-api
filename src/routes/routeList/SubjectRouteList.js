import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";

import { getSubjectList } from "../../controller/SubjectController.js";

export const SubjectRouteList = [
    new RouteList(apiMethod.GET, "/", getSubjectList),
]