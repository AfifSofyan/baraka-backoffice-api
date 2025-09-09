import { dbPool } from "../config/database.js";
import ReportModel from "../models/ReportModel.js";
import ReportChangeLogModel from "../models/ReportChangeLogModel.js";
import NotFound from "../utils/errors/NotFound.js";
import FilterParams from "../utils/requests/filterParams.js";
import InternalServer from "../utils/errors/InternalServer.js";
import TutorModel from "../models/TutorModel.js";
import StudentModel from "../models/StudentModel.js";
import SubjectModel from "../models/SubjectModel.js";

import natural from "natural";

export default {

    async getReportChangeLogs(filter, page, perPage){

        const connection = await dbPool.getConnection()

        try {

            const result = await ReportChangeLogModel.getReportChangeLogs(filter, page, perPage, connection)

            const changeLogs = result.data

            const groupedChangeLogs = []

            for(const changeLog of changeLogs){
                if(!groupedChangeLogs.find( log => log.ReportID == changeLog.ReportID)){
                    groupedChangeLogs.push({
                        ReportID: changeLog.ReportID,
                        TutorID: changeLog.TutorID,
                        TutorName: changeLog.TutorName,
                        Date: changeLog.Date,
                        changeLogs: [changeLog]
                    })
                }else{
                    let groupedChangeLog = groupedChangeLogs.find( log => log.ReportID == changeLog.ReportID)

                    Object.assign(groupedChangeLog, {
                        ...groupedChangeLog,
                        changeLogs: [
                            ...groupedChangeLog.changeLogs,
                            changeLog
                        ]
                    })
                }
            }

            return {
                ...result,
                data: groupedChangeLogs
            }
            
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },
   
}