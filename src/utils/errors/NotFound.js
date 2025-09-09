import ErrorType from "./ErrorType.js";

export default class NotFound extends Error {
    constructor(message = "Laman Yang Dituju Tidak Ditemukan", ...params) {

        super(...params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotFound);
        }

        this.name = "Not Found";
        this.type = ErrorType.customErrType;
        this.message = message;
        this.date = new Date();
        this.statusCode = 404;
    }
}