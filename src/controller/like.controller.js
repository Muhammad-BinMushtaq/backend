import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    const isLike = await Like.findOneAndDelete({
        video: videoId,
        likedBy: req.user._id

    })

    if (isLike) {
        res.status(200)
            .json(ApiResponse(200, {}, "unliked successfully"))
    }

    await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    return res.status(200).json(new ApiResponse(200, null, "Liked the video"));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    const isLiked = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user._id
        }
    )

    if (isLiked) {
        await findOneAndDelete(isLiked._id)
    }
    else {

        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    const isLiked = await Tweet.findOneAndDelete(
        {
            tweet: tweetId,
            likedBy: req.user._id
        }
    )

    if (!isLiked) {
        await Like.create(
            {
                tweet: tweetId,
                likedBy: req.user._id
            }
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos by current user
    const user = mongoose.Types.ObjectId(req.user._id)
    
    const likedVideos = await Like.aggregate([
        { $match: { likedBy: user } },

        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as:videos
            }
        }
    ])


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}