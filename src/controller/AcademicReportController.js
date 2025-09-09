import AcademicReportService from "../services/AcademicReportService.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";
import FilterParams from "../utils/requests/filterParams.js";

export const generateAcademicReports = async (req, res) => {
    
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate
        filter.studentID = req.query.studentID
        filter.searchText = req.query.searchText

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await AcademicReportService.generateAcademicReports(filter, page, perPage)
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res)
    }
}

export const getAcademicReportsDraft = async(req, res) => {
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate
        filter.searchText = req.query.searchText

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await AcademicReportService.getAcademicReportsDraft(filter, page, perPage)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getSentAcademicReports = async(req, res) => {
    try {
        const filter = new FilterParams()

        filter.startDate = req.query.startDate
        filter.endDate = req.query.endDate
        filter.searchText = req.query.searchText
        filter.userID = req.query.userID

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await AcademicReportService.getSentAcademicReports(filter, page, perPage)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getAcademicReportDetail = async(req, res) => {
    try {
        const id = req.params['id']

        const data = await AcademicReportService.getAcademicReportDetail(id)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const getAcademicReportDetailByUniquePath = async(req, res) => {
    try {
        const uniquePath = req.params['uniquePath']

        const data = await AcademicReportService.getAcademicReportDetailByUniquePath(uniquePath)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
}

export const createAcademicReport = async (req, res) => {
    try {
        const data = await AcademicReportService.createAcademicReport(req.body);

        res.json(data);
    } catch (error) {
        HandleError(error, res)
    }
}

export const updateAcademicReport = async (req, res) => {
    try {
        const id = req.params['id']
        const data = await AcademicReportService.updateAcademicReport(req.body, id);

        res.json(data);
    } catch (error) {
        HandleError(error, res)
    }
}

export const deleteAcademicReport = async (req, res) => {
    try {
        const id = req.params['id']
        const data = await AcademicReportService.deleteAcademicReport(id);

        res.json(data);
    } catch (error) {
        HandleError(error, res)
    }
}