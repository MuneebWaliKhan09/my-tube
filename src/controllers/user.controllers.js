import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res)=>{
    // get data from frontend
    // validation || check if not empty
    // check for existing account
    // upload and check for avatar if its uploaded  successfully?
    // upload them to cloudinary
    // create user in db
    // remove password and refresh token field from response
    // check if user created or not
    // finally return response
    const {username, email, password, fullName} = req.body;

    if([username, email, password, fullName].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required")       // dont forget to call this ApiError with New Keyword 
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }]})  // check by multiple fields in databse by $or

    
    if(existedUser){
        throw new ApiError(409, "User with email/username already exists !!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage ? req.files?.coverImage[0]?.path : null

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()  // convert the value of original username to lowercase before saving
    })

    // now for removing resfresh token and password below code
    const createdUser = await User.findById(user._id).select("-password -refreshToken")  //deselect the password and refresh token


    if(!createdUser){
        throw new ApiError(500, "Failed to create user")
    }

    // the reason we added status above and inside beacause above status shows when you are testing Apis in postman in it log on top inside status code log in response
    return res.status(201).json( 
        new ApiResponse(201, createdUser, "User created successfully")
    )

})








export {registerUser}