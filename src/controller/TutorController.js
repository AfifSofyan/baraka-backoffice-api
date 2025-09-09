import TutorService from "../services/TutorService.js";
import AuthService from "../services/AuthService.js";
import FilterParams from "../utils/requests/filterParams.js";
import CreateNotificationRequest from "../data_transfer_objects/requests/CreateNotificationRequest.js";
import NotificationService from "../services/NotificationService.js";
import AdminService from "../services/AdminService.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const getAllTutors = async (req, res) => {
    
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Tutor")

        const filter = new FilterParams();

        filter.userID = req.user.id;
        filter.roleName = req.user.roleName;
        filter.capabilityID = req.query.capabilityID;
        filter.searchText = req.query.searchText;
        filter.isDraft = req.query.isDraft;

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await TutorService.getAllTutors(filter, page, perPage);
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
};

export const createTutor = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Tambah Tutor")

        const data = await TutorService.createTutor(req.body);

        res.json(data);
    } catch (error) {
        HandleError(error, res);
    }
};

export const registerTutor = async (req, res) => {
    try {
        const result = await TutorService.registerTutor(req.body);

        if(result.statusCode == 200){
            const adminList = await AdminService.getAdminList()
            
            adminList.data.forEach(async (admin) => {
                const notificationRequest = CreateNotificationRequest.TutorRegistrationBody(admin.ID, result.data)
                
                await NotificationService.createNotification(notificationRequest)
            })
        }

        res.json(result);
    } catch (error) {
        HandleError(error, res);
    }
};

export const getTotalNewRegistrants = async (req, res) => {
    try {
        
        const data = await TutorService.getTotalNewRegistrants();
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
}

export const updateTutor = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Edit Tutor")

        const data = await TutorService.updateTutor(req.body, req.params['id']);

        res.json(data)
    } catch (error) {
        HandleError(error, res);
    }
};

export const updateTutorByUserID = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Edit Tutor")

        const data = await TutorService.updateTutorByUserID(req.body, req.params['id']);

        res.json(data)
    } catch (error) {
        HandleError(error, res);
    }
};

export const getTutorDetail = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Detail Tutor")

        const filter = new FilterParams();

        filter.tutorID = req.params['id'];

        const data = await TutorService.getTutorDetail(filter);

        res.json(data);
    } catch (error) {
        HandleError(error, res);
    }
};

export const getTutorDetailByUserID = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Detail Tutor")

        const filter = new FilterParams();

        filter.userID = req.params['id'];

        const data = await TutorService.getTutorDetailByUserID(filter);

        res.json(data);
    } catch (error) {
        HandleError(error, res);
    }
};

export const getTutorIDAndName = async (req, res) => {
    try {
        const data = await TutorService.getTutorIDAndName();

        res.json(data);
    } catch (error) {
        HandleError(error, res);
    }
};

export const getTutorIDAndNameWithoutFee = async (req, res) => {
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate

        const data = await TutorService.getTutorIDAndNameWithoutFee(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const deleteTutor = async (req, res) => {
    try{

        const id = req.params['id']
        const data = await TutorService.deleteTutor(id)

        res.json(data)
    } catch (error){
        HandleError(error, res)
    }    
}