import FeeService from "../services/FeeService.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";
import FilterParams from "../utils/requests/filterParams.js";
import CreateNotificationRequest from "../data_transfer_objects/requests/CreateNotificationRequest.js";
import NotificationService from "../services/NotificationService.js";


export const generateFees = async (req, res) => {
    
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate
        filter.tutorID = req.query.tutorID
        filter.searchText = req.query.searchText

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await FeeService.generateFees(filter, page, perPage)
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res)
    }
}

export const getFeeComponents = async(req, res) => {
    try {
        const isActive = req.query.isActive
        const filter = new FilterParams()
        filter.isActive = isActive
        const data = await FeeService.getFeeComponents(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getFeesDraft = async(req, res) => {
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate
        filter.searchText = req.query.searchText

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await FeeService.getFeesDraft(filter, page, perPage)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getSentFees = async(req, res) => {
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate
        filter.searchText = req.query.searchText
        filter.userID = req.query.userID

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await FeeService.getSentFees(filter, page, perPage)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getFeeDetail = async(req, res) => {
    try {
        const id = req.params['id']

        const data = await FeeService.getFeeDetail(id)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getFeeDetailByUniquePath = async(req, res) => {
    try {
        const uniquePath = req.params['uniquePath']

        const data = await FeeService.getFeeDetailByUniquePath(uniquePath)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const createFee = async (req, res) => {
    try {
        const result = await FeeService.createFee(req.body);

        if(result.statusCode == 200){
            const notificationRequest = CreateNotificationRequest.FeeBody(result.data)
                
            await NotificationService.createNotification(notificationRequest)
        }

        res.json(result);
    } catch (error) {
        HandleError(error, res)
    }
}

export const updateFee = async (req, res) => {
    try {
        const id = req.params['id']
        const data = await FeeService.updateFee(req.body, id);

        res.json(data);
    } catch (error) {
        HandleError(error, res)
    }
}

export const deleteFee = async (req, res) => {
    try {
        const id = req.params['id']
        const data = await FeeService.deleteFee(id);

        res.json(data);
    } catch (error) {
        HandleError(error, res)
    }
}