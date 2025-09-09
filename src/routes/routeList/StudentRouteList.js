import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { RequestBodyMiddleware } from "../../middleware/RequestBodyMiddleware.js";

import 
{ 
    getAllStudents,
    getTotalNewRegistrants, 
    createStudent,
    registerStudent,
    updateStudent,
    updateStudentByUserID,
    getStudentDetail,
    getStudentDetailByUserID,
    getStudentIDAndName,
    getStudentIDAndNameWithoutInvoice,
    getStudentIDAndNameWithoutAcademicReport,
    getStudentIDAndNameBasedOnRole,
    deleteStudent
} 
from "../../controller/StudentController.js";

export const StudentRouteList = [
    new RouteList(apiMethod.GET, "/", getAllStudents, VerifyToken),
    new RouteList(apiMethod.GET, "/newregistrants", getTotalNewRegistrants, VerifyToken),
    new RouteList(apiMethod.GET, "/simplified", getStudentIDAndName),
    new RouteList(apiMethod.GET, "/basedonrole", getStudentIDAndNameBasedOnRole, VerifyToken),
    new RouteList(apiMethod.GET, "/withoutinvoice", getStudentIDAndNameWithoutInvoice, VerifyToken),
    new RouteList(apiMethod.GET, "/withoutacademicreport", getStudentIDAndNameWithoutAcademicReport, VerifyToken),
    new RouteList(apiMethod.POST, "/", createStudent, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.POST, "/register", registerStudent),
    new RouteList(apiMethod.PATCH, "/:id", updateStudent, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.PATCH, "/user/:id", updateStudentByUserID, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.GET, "/:id", getStudentDetail),
    new RouteList(apiMethod.GET, "/user/:id", getStudentDetailByUserID, VerifyToken),
    new RouteList(apiMethod.DELETE, "/:id", deleteStudent, VerifyToken),
]