import ResponseService from "../services/ResponseService.js";
import TutorService from "../services/TutorService.js";
import StudentService from "../services/StudentService.js";
import AuthService from "../services/AuthService.js";
import FilterParams from "../utils/requests/filterParams.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const getResponse = async (req, res) => {
    
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Responsi")

        const filter = new FilterParams();

        filter.startDate = req.query.startDate;
        filter.endDate = req.query.endDate;
        filter.searchText = req.query.searchText;
        
        if(req.user.roleName == 'tutor'){
            const tutorFilter = new FilterParams()
            tutorFilter.userID = req.user.id
            const tutorDetail = await TutorService.getTutorDetailByUserID(tutorFilter)

            filter.tutorID = tutorDetail.data.ID
        }

        if(req.user.roleName == 'student'){
            const studentFilter = new FilterParams()
            studentFilter.userID = req.user.id
            const studentDetail = await StudentService.getStudentDetailByUserID(studentFilter)

            filter.studentID = studentDetail.data.ID
        }

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await ResponseService.getResponse(filter, page, perPage);
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
};

export const createReport = async (req, res) => {
    try {
        // const roleID = req.user.roleID
        // await AuthService.isAuthorizedToAccess(roleID, "Tambah Responsi")

        const data = await ResponseService.createReport(req.body);

        res.json(data);
    } catch (error) {
        HandleError(error, res);
    }
};

export const updateReport = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Edit Responsi")

        const data = await ResponseService.updateReport(req.body, req.params['id']);

        res.json(data)
    } catch (error) {
        HandleError(error, res);
    }
};

export const deleteReport = async (req, res) => {
    try {
        const id = req.params['id']
        const data = await ResponseService.deleteReport(id);

        res.json(data);
    } catch (error) {
        HandleError(error, res)
    }
}

export const getReportDetail = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Detail Responsi")

        const filter = new FilterParams()

        filter.reportID = req.params['id']

        const data = await ResponseService.getReportDetail(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
};

export const getNotesSimilarityChecking = async (req, res) => {
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate

        const data = await ResponseService.getNotesSimilarityChecking(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}