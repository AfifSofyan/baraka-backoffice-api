import apiMethod from "../../utils/constants/apiMethod.js";
import RouteList from "../../utils/classes/routeList.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { RequestBodyMiddleware } from "../../middleware/RequestBodyMiddleware.js";

import {
    generateInvoices,
    getInvoiceComponents,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoicesDraft,
    getSentInvoices,
    getInvoiceDetail,
    getInvoiceDetailByUniquePath
} from "../../controller/InvoiceController.js";

export const InvoiceRouteList = [
    new RouteList(apiMethod.GET, "/generated", generateInvoices, VerifyToken),
    new RouteList(apiMethod.GET, "/components", getInvoiceComponents, VerifyToken),
    new RouteList(apiMethod.GET, "/draft", getInvoicesDraft, VerifyToken),
    new RouteList(apiMethod.GET, "/sent", getSentInvoices, VerifyToken),
    new RouteList(apiMethod.GET, "/detail/:uniquePath", getInvoiceDetailByUniquePath),
    new RouteList(apiMethod.GET, "/:id", getInvoiceDetail, VerifyToken),
    new RouteList(apiMethod.POST, "/", createInvoice, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.PATCH, "/:id", updateInvoice, [VerifyToken, RequestBodyMiddleware]),
    new RouteList(apiMethod.DELETE, "/:id", deleteInvoice, [VerifyToken, RequestBodyMiddleware])
]