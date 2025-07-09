import { Router } from "express";
const router = Router()
import { registerUser,loginUser,logoutUser } from "../controller/user.controller.js";
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
router.route('/logout').post(verifyJwt,logoutUser)
router.route('/refresh-token')


export default router