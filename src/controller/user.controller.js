import { asyncHandler } from '../utils/asyncHandlers.js'
import { ApiErrors } from '../utils/customApiErrors.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/customApiRespose.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'


// fuction that generate access and refresh token 
const generateAccessAndRefreshToken = async (userId) => {
   // console.log(userId)
   try {
      let user = await User.findById(userId)
      const accessToken = await user.generateAccessToken()
      const refreshToken = await user.generateRefreshToken()

      user.refreshToken = refreshToken
      user.save({ validateBeforeSave: false })

      return {
         accessToken, refreshToken
      }
   }
   catch (error) {
      throw new ApiErrors(401, error)
   }
}


const registerUser = asyncHandler(async (req, res) => {
   const { userName, fullName, email, password } = req.body

   // check fields are not empty

   if ([userName, fullName, email, password].some((field) =>
      field?.trim() === "")) {
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
   if (req.files && req.files.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) { coverImageLocalPath = req.files.coverImage[0].path }


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


const loginUser = asyncHandler(async (req, res) => {

   // get data from input
   // validate input not empty both 
   // check if user exist or not -if not redirect to signup
   // if found then match password though bcypt
   // if match then send access token and refresh token both through secure cookies
   // send resposne

   const { email, userName, password } = req.body

   // validate input not empty both 
   if ([email, password].some((field) => field?.trim() == "")) {
      throw new ApiErrors(401, "All fields are required")
   }

   // check if user exist or not
   const user = await User.findOne({
      $or: [{ email }, { userName }]
   })

   if (!user) {
      throw new ApiErrors(401, "User not found Register first");
   }

   // compare password
   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
      throw new ApiErrors(401, "incorrect credentials");
   }


   // access token and refresh token - saparate function that generate both and return them

   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

   const options = {
      httpOnly: true,
      secure: true
   }

   const safeUser = await User.findById(user._id).select("-password -refreshToken")

   res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(
            200, {
            user: safeUser, accessToken, refreshToken
         }, "user login successfully"
         )
      )
})


const logoutUser = asyncHandler(async (req, res) => {

   await User.findOneAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
   )

   const options = {
      httpOnly: true,
      secure: true
   }

   return res
      .status(200)
      .clearCookie('refreshToken', options)
      .clearCookie('accessToken', options)
      .json(new ApiResponse(200, {}, "logout useer"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {

   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if (!incomingRefreshToken) {
      throw new ApiErrors(400, "Invalid access");
   }

   let decodedIncomingrefreshAccessToken;

   try {
      decodedIncomingrefreshAccessToken = jwt.verify(incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET_KEY)

   } catch (error) {

      throw new ApiErrors(400, "invalid token")
   }
   console.log(decodedIncomingrefreshAccessToken)
   const user = await User.findById(decodedIncomingrefreshAccessToken.id)

   if (!user) {
      throw new ApiErrors(400, "user not found")
   }

   const options = {
      httpOnly: true,
      secure: true
   }

   if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiErrors(400, "invalid access")
   }

   const { accessToken: NewAccessToken, refreshToken: NewRefreshToken } =
      await generateAccessAndRefreshToken(user._id)

   user.refreshToken = NewRefreshToken
   await user.save({ validateBeforeSave: false })

   res.status(200)
      .cookie("accessToken", NewAccessToken, options)
      .cookie("refreshToken", NewRefreshToken, options)
      .json(200,
         { NewAccessToken, NewRefreshToken },
         "success"
      )
})


const changeCurrentPassword = asyncHandler(async (req, res) => {

   const { oldPassword, newPassword } = req.body
   const user = await User.findById(req.user?._id)

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
   if (!isPasswordCorrect) {
      throw new ApiErrors(400, "incorrect current password")
   }

   user.password = newPassword
   user.save({ validateBeforeSave: false })


   return res
      .status(200)
      .json(
         new ApiResponse(200, {}, "password changed successfully")
      )
})

const getCurrentUser = asyncHandler(async (req, res) => {
   return res
      .status(200)
      .json(new ApiResponse(200, req.user, "succesfully get user"))

})

const updateUserDetails = asyncHandler(async (req, res) => {
   const { email, fullName } = req.body
   if (!(fullName || email)) {
      throw new ApiErrors(400, "All fields are required")
   }

   let user = await findOneAndUpdate(
      req.user?._id,
      {
         $set: { email, password }
      },

      {
         new: true

      }

   ).select(["-password -refreshToken"])


   return res.status(200)
      .json(new ApiResponse(200, user, "userDetails changed successfully"))
})


const updateUserAvatar = asyncHandler(async (req, res) => {
   const avatarLoacalPath = req.file?.path
   if (!avatarLoacalPath) {
      throw new ApiErrors(400, "Avatar not found")
   }
   const avatar = await uploadOnCloudinary(avatarLoacalPath)

   if (!avatar.url) {
      throw new ApiErrors(400, "failed to upload on cloudinary")
   }

   const user = await User.findOneAndUpdate(
      req.user._id,
      {
         $set: { avatar: avatar.url }

      },
      { new: true }
   ).select(["-password"])

   return res
      .status(200)
      .json(
         new ApiResponse(200, user, "successfully updated user avatar")
      )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
   const coverImageLoacalPath = req.file?.path
   if (!coverImageLoacalPath) {
      throw new ApiErrors(400, "cover image not found")
   }
   const coverImage = await uploadOnCloudinary(coverImageLoacalPath)

   if (!coverImage.url) {
      throw new ApiErrors(400, "failed to upload on cloudinary")
   }

   const user = await User.findOneAndUpdate(
      req.user._id,
      {
         $set: { coverImage: coverImage.url }

      },
      { new: true }
   ).select(["-password"])

   return res
      .status(200)
      .json(
         new ApiResponse(200, user, "successfully updated user avatar")
      )
})


const getUserChannelProfile = asyncHandler(async (req, res) => {

   const { userName } = req.params;

   if (!userName?.trim()) {
      throw new ApiErrors(400, "channel not found")
   }





   const channel = await User.aggregate([
      //   first pipeline

      {
         $match: {
            userName: userName.trim()
         }
      },

      //   second pipe line find subscribers pipeline
      {

         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
         }
      },

      // third pipeline
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
         }
      },
      // fourth pipeline
      {
         $addFields: {
            countSubscribers: {
               $size: "$subscribers"
            },
            $addFields: {
               countChannelSubscribed: {
                  $size: "$subscribedTo"
               },
            },

            $addFields: {
               isUserSubsribed: {
                  $if: {
                     $in: [req.user.user_id, "$subscribers.subscriber"],
                     then: true,
                     else: false
                  }
               }
            }
         }
      }
      ,

      // fifth pipeline

      {
         $project: {
            userName: 1,
            email: 1,
            fullName: 1,
            subscribersCount: 1,
            subscribedToCount: 1,
            isUserSubscribed: 1,
            avatar: 1,
            coverImage: 1
         }
      }

   ])

   if (!channel.length) {
      throw new ApiErrors(400, "channel not found")

   }


   return res
      .status(200)
      .json(
         new ApiResponse(200, channel[0], "channel successfully fetched")
      )

})


const getUserHistory = asyncHandler(async (req, res) => {
   const user = await User.aggregate([

      // first pipeline

      {
         $match: {
            _id: mongoose.Schema.Types.ObjectId(req.user._id)
         }
      },

      // second pipelines

      {
         $lookup: {
            from: "videos",
            as: "watchHistory",
            localField: "watchHistory",
            foreignField: "_id",

            pipeline: [
               {
                  $lookup: {
                     from: "users",
                     as: "owner",
                     localField: "owner",
                     foreignField: "_id",


                     pipeline: [
                        {
                           $project: {
                              fullName: 1,
                              userName: 1,
                              avatar: 1
                           }
                        }
                     ]
                  }
               },

               {
                  $addFields: {
                     owner: {
                        $first: "$owner"
                     }
                  }
               }
            ]
         }
      }

   ])

   return res
      .status(200)
      .json(
         new ApiResponse(200, user[0].watchHistory)
      )
})

export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateUserDetails,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile,
   getUserHistory
}