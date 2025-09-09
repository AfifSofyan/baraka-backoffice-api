import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";

import { getUnreadNotifications, getAllNotifications, getNotificationDetail, markNotificationAsRead, markAllNotificationsAsRead } from "../../controller/NotificationController.js";

export const NotificationRouteList = [
    new RouteList(apiMethod.GET, "/", getAllNotifications, [VerifyToken]),
    new RouteList(apiMethod.GET, "/unread", getUnreadNotifications, [VerifyToken]),
    new RouteList(apiMethod.PATCH, "/read/:id", markNotificationAsRead, [VerifyToken]),
    new RouteList(apiMethod.PATCH, "/read_all", markAllNotificationsAsRead, [VerifyToken]),
    new RouteList(apiMethod.GET, "/:id", getNotificationDetail, [VerifyToken]),
]