import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt  from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        // check if cookies have access token that we sended in req body
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "You are not authorized")
        }
    
        // verify token by jwt and to decode token provide secret jwt key
       const decodedToken =  Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
       // find userby id in decoded token 
       const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
       if(!user){
         throw new ApiError(401, "invalid access token")
       }
    
    
       req.user = user
       next()
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token")
    }
})