import ErrorType from "./ErrorType.js";

export default class Forbidden extends Error {
    constructor(message = "Anda Tidak Memiliki Akses", ...params) {

        super(...params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, Forbidden);
        }

        this.name = "Forbidden";
        this.type = ErrorType.customErrType;
        this.message = message;
        this.date = new Date();
        this.statusCode = 403;
    }
}