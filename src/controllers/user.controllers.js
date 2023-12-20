import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId)=> {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()  // generate access token in a specific user by its id and save in doc
        const refreshToken = user.generateRefreshToken() // generate refresh token in a speecific user by its id and save in doc

        // add refresh token to db user doc
        user.refreshToken = refreshToken
        
        // (validateBeforeSave) means  Sometimes you may only want to update a specific field
        // in a document schema without triggering its entire validation process. Disabling automatic 
        // validation allows you to do this selectively ex: just like we are saving refreshToken only one change.
        await user.save( {validateBeforeSave: false} )
        
        // return the access token and refresh token
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Failed to generate access and refresh tokens")
    }
}

const cookiesOptions = {
    httpOnly: true,
    secure: true,
}


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

    const avatarLocalPath = req.files?.avatar ? req.files?.avatar[0]?.path : null
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





// login user

const loginUser = asyncHandler(async (req, res)=>{
    // req body get username and password
    // check if username and password is not empty
    // check if user exists
    // check if password is correct
    // send token in cookie

    const {username, email, password}  = req.body;

    if(!username && !email){
        throw new ApiError(400, "Username or email are required")
    }
    if(!password) throw new ApiError(400, "Password is required")

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    
    if(!user){
        throw new ApiError(404, "User does not exists !")
    }

    const validPassword = await user.isPasswordCorrect(password)

    if(!validPassword){
        throw new ApiError(401, "Invalid password !")
    }

    // call generateAccessAndRefreshTokens function and desctructure the 2 tokens
    const {accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)  // generate access token and refresh token

    // find the user again from db to access the new added 2 tokens and remove unwanted fields by select 
    const logedInUser = await User.findById(user._id).select("-password -refreshToken")

    
    // send the access token and refresh token in cookie
    return res.status(200)
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(
        new ApiResponse(200, {user: logedInUser, refreshToken}, "User loged in successfully")
    )
})


const logoutUser = asyncHandler(async (req, res)=>{
    // update user refresh token to undefined when logging out the user
    const user  = await User.findByIdAndUpdate(req.user._id, {
        $set:{
            refreshToken: undefined
        }
    }, {new :true})

    return res.status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
        new ApiResponse(200, {}, "user logged out Successfully !")
    )
})






const refreshAccessToken = asyncHandler(async (req, res)=>{

    // get refresh token stored in cookies
    const incommingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if(!incommingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

  try {
      // decode the refresh token in cookie with secret
     const decodedToken =  jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
     // find the a user by decoded token _id
     const user = await User.findById(decodedToken?._id)
  
     if(!user){
      throw new ApiError(401, "invalid refresh token")
     }
  
     // if  refresg token in cookie not same as user saved refreshtoken in  db
     if(incommingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "invalid refresh token or expired")
     }
  
    const {accessToken, newRefreshToken}  = await generateAccessAndRefreshTokens(user._id)
  
     return res.status(200)
     .cookie("accessToken",accessToken, cookiesOptions)
     .cookie("refreshToken", newRefreshToken, cookiesOptions)
     .json(
          new ApiResponse(200, {accessToken, refreshToken:  newRefreshToken}, "access token refreshed successfully")
     )

  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token")
  }

})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}