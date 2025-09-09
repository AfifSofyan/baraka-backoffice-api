import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { RequestBodyMiddleware } from "../../middleware/RequestBodyMiddleware.js";

import {
    generateFees,
    getFeeComponents,
    createFee,
    updateFee,
    deleteFee,
    getFeesDraft,
    getSentFees,
    getFeeDetail,
    getFeeDetailByUniquePath
} from "../../controller/FeeController.js";

export const FeeRouteList = [
    new RouteList(apiMethod.GET, "/generated", generateFees, VerifyToken),
    new RouteList(apiMethod.GET, "/components", getFeeComponents, VerifyToken),
    new RouteList(apiMethod.GET, "/draft", getFeesDraft, VerifyToken),
    new RouteList(apiMethod.GET, "/sent", getSentFees, VerifyToken),
    new RouteList(apiMethod.GET, "/detail/:uniquePath", getFeeDetailByUniquePath),
    new RouteList(apiMethod.GET, "/:id", getFeeDetail, VerifyToken),
    new RouteList(apiMethod.POST, "/", createFee, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.PATCH, "/:id", updateFee, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.DELETE, "/:id", deleteFee, [VerifyToken, RequestBodyMiddleware])
]