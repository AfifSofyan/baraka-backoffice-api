import ScheduleService from "../services/ScheduleService.js";
import TutorService from "../services/TutorService.js";
import StudentService from "../services/StudentService.js";
import AuthService from "../services/AuthService.js";
import FilterParams from "../utils/requests/filterParams.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const getSchedules = async (req, res) => {
    
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Jadwal")

        const filter = new FilterParams();

        filter.scheduleMode = req.query.scheduleMode;

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

        const data = await ScheduleService.getSchedules(filter, page, perPage);
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
};

export const getScheduleDetail = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Detail Jadwal")

        const filter = new FilterParams()

        filter.scheduleID = req.params['id']

        const data = await ScheduleService.getScheduleDetail(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
};

export const createSchedule = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Tambah Jadwal")

        const data = await ScheduleService.createSchedule(req.body);

        res.json(data);
    } catch (error) {
        HandleError(error, res);
    }
}

export const updateSchedule = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Edit Jadwal")

        const data = await ScheduleService.updateSchedule(req.body, req.params['id']);

        res.json(data)
    } catch (error) {
        HandleError(error, res);
    }
}

export const deleteSchedule = async (req, res) => {
    try{
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Hapus Jadwal")

        const id = req.params['id']
        const data = await ScheduleService.deleteSchedule(id)

        res.json(data)
    } catch (error){
        HandleError(error, res)
    }    
}