import ErrorType from "./ErrorType.js"

export const HandleError = (error, res) => {
    if(error.type === ErrorType.customErrType){
        return res.status(error.statusCode).json(error)
    }
        return res.status(500).json({
            name: "Server Error",
            message: error.message,
            error: error
    })
}