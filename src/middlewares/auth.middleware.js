import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiErrors } from "../utils/customApiErrors.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";


const verifyJwt = (asyncHandler(async (req, res,next) => {

    try {
        const token =
            req?.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        // console.log(token);

        if (!token) {
            throw new ApiErrors(400, "request not allowed ,invalid token")
        }

        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY)
        // console.log(decodedToken)

        const user = await User.findById(decodedToken?.id).select(["-password -accessToken"])
        if (!user) {
            throw new ApiErrors(400, "token is invalid")
        }
        req.user = user
  
        next()
    }

    catch (error) {
        throw new ApiErrors(500, error.message || "invalid access token")
    }
}))


export default verifyJwt