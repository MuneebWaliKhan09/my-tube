import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.API_Key,
  api_secret: process.env.API_Secret,
});


// just give the localpath of any file to upload on cloudinary function below 
const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return console.log("local file path not found");
        // upload the file now
      const res =  await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded to cloudinary
        // console.log("file uploaded to cloudinary successfully", res.url);

        fs.unlinkSync(localFilePath);  // clear the local , temporary,success files if uploadation process got successful,
        return res    // choice to send full response or only res.url
    } catch (error) {
        fs.unlinkSync(localFilePath);  // clear the local , temporary, failed  files  if uploadation process got failed, 
        return null
    }
}



export {uploadOnCloudinary}