import LocationService from "../services/LocationService.js";
import FilterParams from "../utils/requests/filterParams.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const getAllProvinces = async (req, res) => {
    
    try {

        const data = await LocationService.getAllProvinces();
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
};

export const getCitiesByProvinceID = async (req, res) => {

    try {

        const filter = new FilterParams()

        filter.provinceID = req.query.provinceID

        const data = await LocationService.getCitiesByProvinceID(filter)

        res.json(data)
    } catch (error){
        HandleError(error, res);
    }
}