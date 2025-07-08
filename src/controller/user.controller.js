import { asyncHandler } from '../utils/asyncHandlers.js'
import { ApiErrors } from '../utils/customApiErrors.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/customApiRespose.js'

const registerUser = asyncHandler(async (req, res) => {
   const { userName, fullName, email, password } = req.body

   // check fields are not empty

   if ([userName, fullName, email, password].some((field) =>
      field?.trim() === "")
   ) {
      throw new ApiErrors(400, "All fields are required")
   }


   // check if user already exists
   const existedUser = await User.findOne({
      $or: [{ userName }, { email }]
   })


   if (existedUser) {
      throw new ApiErrors(409, "Username or email exists")

   }

   // check for files

   const avatarLocalPath = req.files?.avatar?.[0]?.path
   // const coverImageLocalPath = req.files?.coverImage?.[0]?.path

   let coverImageLocalPath;
   if (req.files && req.files.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {  coverImageLocalPath = req.files.coverImage[0].path }


   if (!avatarLocalPath) {
      throw new ApiErrors(400, "avatar is required")
   }



   // upload files on cloudinary
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
      throw new ApiErrors(400, "avatar is required")

   }

   // create user object and send to database
   const user = await User.create({
      userName: userName.toLowerCase(),
      email,
      password,
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",

   })
   // console.log("🔍 Checking for existing user:", userName, email);
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if (!createdUser) {
      throw new ApiErrors(500, "some thing went wrong at server side during login")
   }

   return res.status(201).json(
      new ApiResponse(200, createdUser, "user created successfully")

   )














   // get userdata from login 
   // validate -not empty
   // checks if user already exists or not
   // check avatar 
   // send to cloudnary
   // create user object
   // exclude password and refresh token
   // check if user created or not
   // response send to front end





})

export { registerUser }