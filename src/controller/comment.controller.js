import mongoose from "mongoose"
import { Comment } from '../models/comment.model.js'
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    const skip = parseInt((page - 1) * parseInt(limit))

    const getComments = await Comment.aggregate([

        { $match: { video: videoId } },
        { $skip: skip },
        { $limit: parseInt(limit) }


    ])

    return res
        .status(200
            .json(new ApiResponse(200, getComments, "succcess"))
        )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body
    const videoId = req.params

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "success"))



})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentContent } = req.body

    const { commentId } = req.params
    const comment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        { $set: { content: commentContent } },
        { new: true }
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const commentId = req.params
    const comment = await Comment.findByIdAndDelete(
        { _id: commentId }
    )



})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}