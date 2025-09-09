import AuthService from "../services/AuthService.js";
import PresenceService from "../services/PresenceService.js";
import TutorService from "../services/TutorService.js";
import StudentService from "../services/StudentService.js";
import FilterParams from "../utils/requests/filterParams.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const getPresence = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Presensi")
        
        const filter = new FilterParams();

        filter.presenceMode = req.query.presenceMode;

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

        const data = await PresenceService.getPresence(filter, page, perPage);
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
};

export const createPresenceScheduleNote = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Tambah Catatan Presensi")

        const data = await PresenceService.createPresenceScheduleNote(req.body)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const updatePresenceScheduleNote = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Edit Catatan Presensi")

        const inputData = req.body
        const id = req.params['id']

        const data = await PresenceService.updatePresenceScheduleNote(inputData, id)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const deletePresenceScheduleNote = async (req, res) => {
    try{
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Hapus Catatan Presensi")

        const id = req.params['id']
        const data = await PresenceService.deletePresenceScheduleNote(id)

        res.json(data)
    } catch (error){
        HandleError(error, res)
    }    
}

export const createPresenceReportNote = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Tambah Catatan Presensi")

        const data = await PresenceService.createPresenceReportNote(req.body)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const updatePresenceReportNote = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Edit Catatan Presensi")

        const inputData = req.body
        const id = req.params['id']

        const data = await PresenceService.updatePresenceReportNote(inputData, id)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const deletePresenceReportNote = async (req, res) => {
    try{
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Hapus Catatan Presensi")

        const id = req.params['id']
        const data = await PresenceService.deletePresenceReportNote(id)

        res.json(data)
    } catch (error){
        HandleError(error, res)
    }    
}