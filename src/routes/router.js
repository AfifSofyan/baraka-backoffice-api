import express from "express"
import { generateRoutes } from "./routeGenerator.js";
import { StudentRouteList } from "./routeList/StudentRouteList.js";
import { AuthRouteList } from "./routeList/AuthRouteList.js";
import { PresenceRouteList } from "./routeList/PresenceRouteList.js";
import { ProgramRouteList } from "./routeList/ProgramRouteList.js";
import { LocationRouteList } from "./routeList/LocationRouteList.js";
import { TutorRouteList } from "./routeList/TutorRouteList.js";
import { CapabilityRouteList } from "./routeList/CapabilityRouteList.js";
import { ScheduleRouteList } from "./routeList/ScheduleRouteList.js";
import { SubjectRouteList } from "./routeList/SubjectRouteList.js";
import { AdminRouteList } from "./routeList/AdminRouteList.js";
import { ResponseRouteList } from "./routeList/ResponseRouteList.js";
import { ReportChangeLogRouteList } from "./routeList/ReportChangeLogRouteList.js"
import { InvoiceRouteList } from "./routeList/InvoiceRouteList.js";
import { FeeRouteList } from "./routeList/FeeRouteList.js";
import { AcademicReportRouteList } from "./routeList/AcademicReportRouteList.js";
import { DashboardRouteList } from "./routeList/DashboardRouteList.js";
import { NotificationRouteList } from "./routeList/NotificationRouteList.js";

const router = express.Router()

generateRoutes("", router, AuthRouteList);
generateRoutes("/academics", router, AcademicReportRouteList);
generateRoutes("/dashboard", router, DashboardRouteList);
generateRoutes("/students", router, StudentRouteList);
generateRoutes("/tutors", router, TutorRouteList);
generateRoutes("/presence", router, PresenceRouteList);
generateRoutes("/programs", router, ProgramRouteList);
generateRoutes("/location", router, LocationRouteList);
generateRoutes("/capabilities", router, CapabilityRouteList);
generateRoutes("/schedules", router, ScheduleRouteList);
generateRoutes("/subjects", router, SubjectRouteList);
generateRoutes("/admin", router, AdminRouteList);
generateRoutes("/response", router, ResponseRouteList);
generateRoutes("/reportchangelogs", router, ReportChangeLogRouteList);
generateRoutes("/invoice", router, InvoiceRouteList);
generateRoutes("/fee", router, FeeRouteList);
generateRoutes("/notifications", router, NotificationRouteList);

export default router;