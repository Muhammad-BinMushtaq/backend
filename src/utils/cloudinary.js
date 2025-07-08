
import { v2 as cloudinary } from 'cloudinary';

import fs from 'fs'
import { ApiErrors } from './customApiErrors.js';
// console.log("this is api key", process.env.CLOUDINARY_API_KEY)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: `${process.env.CLOUDINARY_API_KEY}`,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    console.log("starting the project ")
    try {
        if (!localFilePath) throw new ApiErrors(401, "Local file not found")

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        if (!response) throw new Error(400, "file not uploaded on cloudnary")

            console.log("This is response >>> ",response)
             fs.unlinkSync(localFilePath);
            return (response)

    } catch (error) {

        
            fs.unlinkSync(localFilePath);
        
        throw new ApiErrors(400, error )
    }
}
export { uploadOnCloudinary }


