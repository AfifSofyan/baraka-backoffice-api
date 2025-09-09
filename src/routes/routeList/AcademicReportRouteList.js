import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { RequestBodyMiddleware } from "../../middleware/RequestBodyMiddleware.js";

import {
    generateAcademicReports,
    createAcademicReport,
    updateAcademicReport,
    deleteAcademicReport,
    getAcademicReportsDraft,
    getSentAcademicReports,
    getAcademicReportDetail,
    getAcademicReportDetailByUniquePath
} from "../../controller/AcademicReportController.js";

export const AcademicReportRouteList = [
    new RouteList(apiMethod.GET, "/generated", generateAcademicReports, VerifyToken),
    new RouteList(apiMethod.GET, "/draft", getAcademicReportsDraft, VerifyToken),
    new RouteList(apiMethod.GET, "/sent", getSentAcademicReports, VerifyToken),
    new RouteList(apiMethod.GET, "/detail/:uniquePath", getAcademicReportDetailByUniquePath),
    new RouteList(apiMethod.GET, "/:id", getAcademicReportDetail, VerifyToken),
    new RouteList(apiMethod.POST, "/", createAcademicReport, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.PATCH, "/:id", updateAcademicReport, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.DELETE, "/:id", deleteAcademicReport, [VerifyToken, RequestBodyMiddleware])
]