// this class is for error handling when calling the api or somthing went wrng in api
class ApiError extends Error{
     constructor(statusCode, message = "something went wrong !", errors= [], stack = "" ){
        super(message) // overirde the default Error constructor message with my message
        this.statusCode = statusCode  // override the status code default with my status code
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack // capture the error location 
        }else{
            Error.captureStackTrace(this , this.constructor)
        }
    }
}


export {ApiError}