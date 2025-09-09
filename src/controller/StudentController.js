import StudentService from "../services/StudentService.js";
import TutorService from "../services/TutorService.js";
import ScheduleService from "../services/ScheduleService.js";
import AuthService from "../services/AuthService.js";
import NotificationService from "../services/NotificationService.js";
import CreateNotificationRequest from "../data_transfer_objects/requests/CreateNotificationRequest.js";
import FilterParams from "../utils/requests/filterParams.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";
import AdminService from "../services/AdminService.js";

export const getAllStudents = async (req, res) => {
    
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Siswa")

        const filter = new FilterParams()

        filter.studentStatusID = req.query.studentStatusID
        filter.searchText = req.query.searchText
        filter.roleName = req.user.roleName

        if(req.user.roleName == 'tutor'){
            const tutorFilter = new FilterParams()
            tutorFilter.userID = req.user.id
            const tutorDetail = await TutorService.getTutorDetailByUserID(tutorFilter)

            const scheduleFilter = new FilterParams()
            scheduleFilter.tutorID = tutorDetail.data.ID
            const schedules = await ScheduleService.getSchedulesByTutorID(scheduleFilter)

            const studentIDs = schedules.data.map(schedule => schedule.StudentID)

            filter.studentIDs = studentIDs
            filter.isActive = tutorDetail.data.IsActive
        }

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await StudentService.getAllStudents(filter, page, perPage);
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
};

export const getTotalNewRegistrants = async (req, res) => {
    try {
        
        const data = await StudentService.getTotalNewRegistrants();
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
}

export const createStudent = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Tambah Siswa")

        const data = await StudentService.createStudent(req.body);

        res.json(data);
    } catch (error) {
        HandleError(error, res);
    }
};

export const registerStudent = async (req, res) => {
    try {
        const result = await StudentService.registerStudent(req.body);
        

        if(result.statusCode == 200){
            const adminList = await AdminService.getAdminList()
            
            adminList.data.forEach(async (admin) => {
                const notificationRequest = CreateNotificationRequest.StudentRegistrationBody(admin.ID, result.data)
                
                await NotificationService.createNotification(notificationRequest)
            })
        }

        res.json(result);
    } catch (error) {
        HandleError(error, res);
    }
};

export const updateStudent = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Edit Siswa")

        const data = await StudentService.updateStudent(req.body, req.params['id']);

        res.json(data)
    } catch (error) {
        HandleError(error, res);
    }
};

export const updateStudentByUserID = async (req, res) => {
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Edit Siswa")

        const data = await StudentService.updateStudentByUserID(req.body, req.params['id']);

        res.json(data)
    } catch (error) {
        HandleError(error, res);
    }
};

export const getStudentDetail = async (req, res) => {
    try {
        // const roleID = req.user.roleID
        // await AuthService.isAuthorizedToAccess(roleID, "Detail Siswa")

        const filter = new FilterParams()

        filter.studentID = req.params['id']

        const data = await StudentService.getStudentDetail(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
};

export const getStudentDetailByUserID = async (req, res) => {
    try {
        const roleID = req.user.roleID
        
        await AuthService.isAuthorizedToAccess(roleID, "Detail Siswa")

        const filter = new FilterParams()

        filter.userID = req.params['id']

        const data = await StudentService.getStudentDetailByUserID(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
};

export const getStudentIDAndName = async (req, res) => {
    try {
        const data = await StudentService.getStudentIDAndName()

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getStudentIDAndNameBasedOnRole = async (req, res) => {
    try {
        const userID = req.user.id
        const roleName = req.user.roleName

        const filter = new FilterParams()

        filter.userID = userID
        filter.roleName = roleName

        const data = await StudentService.getStudentIDAndNameBasedOnRole(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getStudentIDAndNameWithoutInvoice = async (req, res) => {
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate

        const data = await StudentService.getStudentIDAndNameWithoutInvoice(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getStudentIDAndNameWithoutAcademicReport = async (req, res) => {
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate

        const data = await StudentService.getStudentIDAndNameWithoutAcademicReport(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const deleteStudent = async (req, res) => {
    try{

        const id = req.params['id']
        const data = await StudentService.deleteStudent(id)

        res.json(data)
    } catch (error){
        HandleError(error, res)
    }    
}