import NotificationService from "../services/NotificationService.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";
import FilterParams from "../utils/requests/filterParams.js";

export const getUnreadNotifications = async (req, res) => {
    
    try {
        const filter = new FilterParams()

        filter.userID = req.user.id

        const data = await NotificationService.getUnreadNotifications(filter)
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
};

export const getAllNotifications = async (req, res) => {
    
    try {
        const filter = new FilterParams()

        filter.userID = req.user.id

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await NotificationService.getAllNotifications(filter, page, perPage)
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
};

export const getNotificationDetail = async (req, res) => {
    try {
        const filter = new FilterParams()

        filter.id = req.params['id']

        const data = await NotificationService.getNotificationDetail(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res);
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const data = await NotificationService.markNotificationAsRead(req.params['id']);

        res.json(data)
    } catch (error) {
        HandleError(error, res);
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const filter = new FilterParams()

        filter.userID = req.user.id

        const data = await NotificationService.markAllNotificationsAsRead(filter);

        res.json(data)
    } catch (error) {
        HandleError(error, res);
    }
};