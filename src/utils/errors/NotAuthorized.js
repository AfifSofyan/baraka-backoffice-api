import ErrorType from "./ErrorType.js";

export default class NotAuthorized extends Error {
    constructor(message = "Akses Tidak Diizinkan", ...params) {

        super(...params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotAuthorized);
        }

        this.name = "Not Authorized";
        this.type = ErrorType.customErrType;
        this.message = message;
        this.date = new Date();
        this.statusCode = 401;
    }
}