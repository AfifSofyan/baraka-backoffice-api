import ErrorType from "./ErrorType.js";

export default class InternalServer extends Error {
    constructor(message = "Terjadi Error Pada Server", ...params) {

        super(...params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InternalServer);
        }

        this.name = "Internal Server";
        this.type = ErrorType.customErrType;
        this.message = message;
        this.date = new Date();
        this.statusCode = 500;
    }
}