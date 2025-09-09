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

    async getResponse(filter, page, perPage){

        const connection = await dbPool.getConnection();

        try {

            const data = await ReportModel.getReports(filter, page, perPage, connection)

            return data;
            
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getNotesSimilarityChecking(filter){

        const connection = await dbPool.getConnection();

        try {

            const data = await ReportModel.getReportNotesForSimilarityChecking(filter, connection)      

            const result = this.findSimilarNotes(data)

            return result
            
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getReportDetail(filter){
        const connection = await dbPool.getConnection()

        try {
            const reportDetail = await ReportModel.getReportDetail(filter, connection)

            return {
                message: "Get Report Detail Successfully",
                data: reportDetail,
            }


        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async createReport(data){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            let dataToReturn = []

            if(data.IsJoin){
                data.MultipleStudentsData.forEach(async (studentData) => {
                    const dataToPost = {
                        Date: data.Date,
                        TimeStart: data.TimeStart,
                        TimeEnd: data.TimeEnd,
                        Duration: data.Duration,
                        TutorID: data.TutorID,
                        ModeID: data.ModeID,
                        IsJoin: true,
                        JoinCode: data.JoinCode,
                        
                        StudentID: studentData.StudentID,
                        SubjectID: data.SubjectID,
                        Topic: studentData.Topic,
                        Score: studentData.Score,
                        AffectiveID: studentData.AffectiveID,
                        Note: studentData.Note,
                        NextTopic: studentData.NextTopic,

                        CreatedDate: data.CreatedDate,
                        CreatedBy: data.CreatedBy,
                        UpdatedDate: data.UpdatedDate,
                        UpdatedBy: data.UpdatedBy

                    }

                    const reportID = await ReportModel.createReport(dataToPost, connection)

                    dataToReturn.push(reportID)

                })
            }else{
                const reportID = await ReportModel.createReport(data, connection)
                dataToReturn = reportID
            }

            connection.commit()

            return {
                message:"Create Report Succesfully",
                data: {
                    ReportID : dataToReturn
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async updateReport(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const reportDetailFilter = new FilterParams()
            reportDetailFilter.reportID = id

            const currentReportDetail = await ReportModel.getReportDetail(reportDetailFilter, connection)

            let differences = []

            for (const key in data) {
                if (data.hasOwnProperty(key) && currentReportDetail.hasOwnProperty(key) && this.reportPropertiesTitle.hasOwnProperty(key)) {
                    if (data[key] !== currentReportDetail[key]) {
                        differences.push({
                            property: key,
                            data_title: this.reportPropertiesTitle[key],
                            before: currentReportDetail[key],
                            after: data[key]
                        })
                    }
                }
            }

            differences = await Promise.all(differences.map(async (item) => {
                if (item.property == 'StudentID') {
                    const studentBeforeFilter = new FilterParams()
                    studentBeforeFilter.studentID = item.before
                    const studentAfterFilter = new FilterParams()
                    studentAfterFilter.studentID = item.after
            
                    const studentBefore = await StudentModel.getStudentDetail(studentBeforeFilter, connection)
                    const studentAfter = await StudentModel.getStudentDetail(studentAfterFilter, connection)
            
                    return {
                        ...item,
                        property: 'Student',
                        before: studentBefore.Name,
                        after: studentAfter.Name
                    }
                } else if (item.property == 'TutorID') {
                    const tutorBeforeFilter = new FilterParams()
                    tutorBeforeFilter.tutorID = item.before
                    const tutorAfterFilter = new FilterParams()
                    tutorAfterFilter.tutorID = item.after
            
                    const tutorBefore = await TutorModel.getTutorDetail(tutorBeforeFilter, connection)
                    const tutorAfter = await TutorModel.getTutorDetail(tutorAfterFilter, connection)
            
                    return {
                        ...item,
                        property: 'Tutor',
                        before: tutorBefore.Name,
                        after: tutorAfter.Name
                    }
                } else if (item.property == 'SubjectID') {
            
                    const subjectBefore = await SubjectModel.getSubjectDetail(item.before, connection)
                    const subjectAfter = await SubjectModel.getSubjectDetail(item.after, connection)
            
                    return {
                        ...item,
                        property: 'Subject',
                        before: subjectBefore.Subject,
                        after: subjectAfter.Subject
                    }
                }
                else {
                    return item;
                }
            }))

            try {
                const changeLogCreated = await ReportChangeLogModel.createReportChangeLog({
                    ReportID: id,
                    Differences: JSON.stringify(differences),
                    CreatedDate: data.CreatedDate,
                    CreatedBy: data.CreatedBy
                }, connection)
            } catch (error) {
                throw new InternalServer(`Gagal mencatatkan log perubahan. Silahkan coba kembali: ${error}`)
            }

            const affectedReportRows = await ReportModel.updateReport(data, id, connection)            

            if(affectedReportRows === 1){

                connection.commit()

                return {
                    message:"Update Report Succesfully",
                    data: {
                        ReportID : id
                    }
                }
            }else{
                throw new NotFound("Data responsi yang ingin diubah tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async deleteReport(id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            
            const affectedReportRows = await ReportModel.deleteReport(id, connection)

            if(affectedReportRows !== 1){
                throw new InternalServer(`Data responsi yang ingin dihapus tidak ditemukan`)
            }
        

            connection.commit()

            return {
                message:"Delete Report Succesfully",
                data: {
                    ReportID : id
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    // Report Properties Title

    reportPropertiesTitle: {
        TutorID: "Tutor",
        StudentID: "Siswa",
        Date: "Tanggal Les",
        TimeStart: "Waktu Mulai",
        TimeEnd: "Waktu Selesai",
        Duration: "Durasi",
        SubjectID: "Mata Pelajaran",
        Topic: "Topik",
        ModeID: "Mode",
        Score: "Skor",
        AffectiveID: "Penilaian Afektif",
        Note: "Catatan Pembalajaran",
        NextTopic: "Materi Selanjutnya"
    },


    // methods for similarity checking

    cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    },

    textToVector(text, corpus) {
        const tokenizer = new natural.WordTokenizer()
        const tf = {};
        const tokens = tokenizer.tokenize(text);
        tokens.forEach(token => {
            if (!tf[token]) {
                tf[token] = 0;
            }
            tf[token]++;
        });
        return corpus.map(word => tf[word] || 0);
    },

    findSimilarNotes(reports) {
        const tokenizer = new natural.WordTokenizer()
        const corpus = Array.from(new Set(reports.flatMap(report => tokenizer.tokenize(report.Note))));
        const vectors = reports.map(report => this.textToVector(report.Note, corpus));
    
        let result = []

        for (let i = 0; i < reports.length; i++) {
            for (let j = i + 1; j < reports.length; j++) {
                const similarity = this.cosineSimilarity(vectors[i], vectors[j]);
                if (similarity > 0.9) {
                    result.push({
                        IDs: `${reports[i].ID}, ${reports[j].ID}`,
                        Authors: reports[i].TutorID == reports[j].TutorID ? reports[i].TutorName : `${reports[i].TutorName}, ${reports[j].TutorName}`,
                        OriginNote: reports[i].Note,
                        SimilarNote: reports[j].Note,
                        Similarity: similarity
                    })
                }
            }
        }

        return result
    },
   
}