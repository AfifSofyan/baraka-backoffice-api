import InvoiceService from "../services/InvoiceService.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";
import FilterParams from "../utils/requests/filterParams.js";
import CreateNotificationRequest from "../data_transfer_objects/requests/CreateNotificationRequest.js";
import NotificationService from "../services/NotificationService.js";

export const generateInvoices = async (req, res) => {
    
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate
        filter.studentID = req.query.studentID
        filter.searchText = req.query.searchText

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await InvoiceService.generateInvoices(filter, page, perPage)
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res)
    }
}

export const getInvoiceComponents = async(req, res) => {
    try {
        const isActive = req.query.isActive
        const filter = new FilterParams()
        filter.isActive = isActive
        const result = await InvoiceService.getInvoiceComponents(filter)

        res.json(result)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getInvoicesDraft = async(req, res) => {
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate
        filter.searchText = req.query.searchText

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await InvoiceService.getInvoicesDraft(filter, page, perPage)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getSentInvoices = async(req, res) => {
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate
        filter.searchText = req.query.searchText
        filter.userID = req.query.userID

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await InvoiceService.getSentInvoices(filter, page, perPage)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getInvoiceDetail = async(req, res) => {
    try {
        const id = req.params['id']

        const data = await InvoiceService.getInvoiceDetail(id)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getInvoiceDetailByUniquePath = async(req, res) => {
    try {
        const uniquePath = req.params['uniquePath']

        const data = await InvoiceService.getInvoiceDetailByUniquePath(uniquePath)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const createInvoice = async (req, res) => {
    try {
        const result = await InvoiceService.createInvoice(req.body);
        
        if(result.statusCode == 200){
            result.data.InvoiceStudents.forEach(async (student) => {
                const notificationRequest = CreateNotificationRequest.InvoiceBody(result.data, student)
                
                await NotificationService.createNotification(notificationRequest)
            })
        }

        res.json(result);
    } catch (error) {
        HandleError(error, res)
    }
}

export const updateInvoice = async (req, res) => {
    try {
        const id = req.params['id']
        const data = await InvoiceService.updateInvoice(req.body, id);

        res.json(data);
    } catch (error) {
        HandleError(error, res)
    }
}

export const deleteInvoice = async (req, res) => {
    try {
        const id = req.params['id']
        const data = await InvoiceService.deleteInvoice(id);

        res.json(data);
    } catch (error) {
        HandleError(error, res)
    }
}