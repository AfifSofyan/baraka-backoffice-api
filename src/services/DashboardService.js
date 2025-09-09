import { dbPool } from "../config/database.js"
import ScheduleModel from "../models/ScheduleModel.js"
import StudentModel from "../models/StudentModel.js"
import TutorModel from "../models/TutorModel.js"
import ReportModel from "../models/ReportModel.js"
import FilterParams from "../utils/requests/filterParams.js"
import moment from "moment"

export default {

    async getDashboardInformation(req){
        const connection = await dbPool.getConnection()

        try {
            const roleName = req.user.roleName

            const thisMonthReportFilter = new FilterParams()
            thisMonthReportFilter.startDate = moment().startOf('month').format('YYYY-MM-DD')
            thisMonthReportFilter.endDate = moment().format('YYYY-MM-DD')

            const lastMonthReportFilter = new FilterParams()
            lastMonthReportFilter.startDate = moment().startOf('month').subtract(1, 'month').format('YYYY-MM-DD')
            lastMonthReportFilter.endDate = moment().subtract(1, 'month').format('YYYY-MM-DD')

            let data = {}

            if(['admin', 'superadmin'].includes(roleName)){
                const studentStatus = await StudentModel.getStudentStatus(connection)

                const studentStatusClassification = {
                    aktif: studentStatus.filter(student => student.StatusID === 1).length,
                    libur: studentStatus.filter(student => student.StatusID === 2).length,
                    off: studentStatus.filter(student => student.StatusID === 3).length
                }

                const totalClassesThisMonth = await ReportModel.getTotalReports(thisMonthReportFilter, connection)

                const totalClassesLastMonth = await ReportModel.getTotalReports(lastMonthReportFilter, connection)

                const totalClassesComparison = {
                    totalClassesLastMonth : totalClassesLastMonth,
                    totalClassesThisMonth : totalClassesThisMonth,
                    differences : totalClassesThisMonth - totalClassesLastMonth
                }

                const totalSchedules = await ScheduleModel.getTotalSchedules(new FilterParams(), connection)

                const totalTutors = await TutorModel.getTotalTutors(connection)
                const totalTutorsWithSchedule = (await TutorModel.getTutorIDWithSchedule(new FilterParams(), 1, 999999, connection)).length

                const tutorClassification = {
                    totalTutorsWithSchedule: totalTutorsWithSchedule,
                    totalTutorsWithoutSchedule: totalTutors - totalTutorsWithSchedule,
                }

                data = {
                    studentStatusClassification: studentStatusClassification,
                    tutorClassification: tutorClassification,
                    totalClassesComparison: totalClassesComparison,
                    totalSchedules: totalSchedules
                }

            }if(roleName === 'tutor'){
                const filter = new FilterParams()
                filter.userID = req.user.id

                const tutorDetail = await TutorModel.getTutorDetailByUserID(filter, connection)
                
                filter.tutorID = tutorDetail.ID
                const totalSchedules = await ScheduleModel.getTotalSchedules(filter, connection)

                const totalStudents = await ScheduleModel.getTotalStudentsBySchedules(filter, connection)

                const schedules = await ScheduleModel.getSchedulesByTutorID(filter, connection)

                thisMonthReportFilter.tutorID = tutorDetail.ID

                const totalClasses = await ReportModel.getTotalReports(thisMonthReportFilter, connection)

                data = {
                    totalSchedules: totalSchedules,
                    totalStudents: totalStudents,
                    incomingClass: this.getNearestSchedule(schedules),
                    totalClasses: totalClasses
                }

            } if(roleName === 'student'){
                const filter = new FilterParams()
                filter.userID = req.user.id

                const studentDetail = await StudentModel.getStudentDetailByUserID(filter, connection)
                
                filter.studentID = studentDetail.ID
                const totalSchedules = await ScheduleModel.getTotalSchedules(filter, connection)

                const totalTutors = await ScheduleModel.getTotalTutorsBySchedules(filter, connection)

                const schedules = await ScheduleModel.getSchedulesByStudentID(filter, connection)

                thisMonthReportFilter.studentID = studentDetail.ID

                const totalClasses = await ReportModel.getTotalReports(thisMonthReportFilter, connection)

                data = {
                    totalSchedules: totalSchedules,
                    totalTutors: totalTutors,
                    incomingClass: this.getNearestSchedule(schedules),
                    totalClasses: totalClasses
                }

            }

            return {
                message: "Get Dashboard Information Successfully",
                data: data,
            }

        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    getNearestSchedule(schedules) {
        const now = new Date();
        const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds(); // current time in seconds
    
        // Filter schedules based on StartDate
        const filteredSchedules = schedules.map(schedule => {
            const startDate = new Date(schedule.StartDate);
            if (startDate > now) {
                return {
                    ...schedule,
                    datetime: schedule.StartDate + ' ' + schedule.Time // Combine StartDate and Time
                };
            } else {
                const dayDiff = (schedule.DayOfTheWeek - startDate.getDay() + 7) % 7;
                const nextDayDate = new Date(now);
                nextDayDate.setDate(now.getDate() + dayDiff);
                const nextDateTime = nextDayDate.toISOString().split('T')[0] + ' ' + schedule.Time; // Combine next day's date and Time
                return {
                    ...schedule,
                    datetime: nextDateTime
                };
            }
        });
    
        // Find the schedule with the nearest datetime to now
        const nearestSchedule = filteredSchedules.reduce((nearest, current) => {
            const currentDateTime = new Date(current.datetime);
            const currentDiff = Math.abs(currentDateTime - now);
            const nearestDateTime = new Date(nearest.datetime);
            const nearestDiff = Math.abs(nearestDateTime - now);
            return currentDiff < nearestDiff ? current : nearest;
        });
    
        return nearestSchedule;
    }   
    
}