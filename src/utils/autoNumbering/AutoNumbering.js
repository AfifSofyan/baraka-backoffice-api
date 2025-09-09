import AutoNumberingModel from "../../models/AutoNumberingModel.js";
import monthRomanNumerals from "../../utils/constants/monthRomanNumerals.js";
import NotFound from "../../utils/errors/NotFound.js";
import InternalServer from "../../utils/errors/InternalServer.js";
import moment from "moment";

export default {

    async generateDocumentAutoNumber(tableName, connection){
        try {
            const autoNumber =  await AutoNumberingModel.getAutoNumberDetail(tableName, connection)
            let result = null

            if(autoNumber.length == 0){
                throw new NotFound(`Penamaan otomatis untuk tabel ${tableName} tidak ditemukan`)
            }

            const currentMonthNumeral = monthRomanNumerals.find(obj => obj.month === moment().month() + 1).numeral

            if(autoNumber[0].MonthNumeral == currentMonthNumeral){
                const autoNumberAffectedRows = await AutoNumberingModel.increaseDocumentNumber(tableName, connection)

                if(autoNumberAffectedRows === 1){
                    result =  await AutoNumberingModel.getAutoNumberDetail(tableName, connection)
                }else{
                    throw new InternalServer(`Penamaan otomatis untuk tabel ${tableName} gagal dilakukan`)
                }
            }else{
                const autoNumberAffectedRows = await AutoNumberingModel.resetDocumentNumber(moment().year(), currentMonthNumeral, tableName, connection)
                if(autoNumberAffectedRows === 1){
                    result =  await AutoNumberingModel.getAutoNumberDetail(tableName, connection)
                }else{
                    throw new InternalServer(`Penamaan otomatis untuk tabel ${tableName} gagal dilakukan`)
                }
            }

            const {DocumentCode, Year, MonthNumeral, DocumentNumber} = result[0]
            const documentNumberString = `${DocumentCode}-BRK-${Year}-${MonthNumeral}-${DocumentNumber.toString().padStart(4, "0")}`
    
            return documentNumberString;   
        } catch (error) {
            throw error;
        }
    }

    
}