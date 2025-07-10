import { Router } from "express";
const router = Router()
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateUserDetails,
    updateUserCoverImage,
    getUserChannelProfile,
    getUserHistory
}
    from "../controller/user.controller.js";



import { upload } from "../middlewares/multer.middleware.js";
import verifyJwt from "../middlewares/auth.middleware.js";

// register user

router.route('/register').post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)


// login user

router.route('/login').post(loginUser)

// protected routes
router.route('/logout').post(verifyJwt, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJwt, changeCurrentPassword)
router.route('/get-user').get(verifyJwt, getCurrentUser)
router.route('/update-user-details').patch(verifyJwt, updateUserDetails)
router.route('/update-user-avatar').patch(verifyJwt, upload.single("avatar"), updateUserAvatar)
router.route('/update-user-coverImg').patch(verifyJwt, upload.single("avatar"), updateUserCoverImage)
router.route('/channel/:userName').get(verifyJwt, getUserChannelProfile)
router.route('/user-history').get(getUserHistory)



export default router