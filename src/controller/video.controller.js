import mongoose from "mongoose"
import { Video } from '../models/video.model.js'
import { User } from "../models/user.model.js"
import { ApiErrors } from "../utils/customApiErrors.js"
import { ApiResponse } from "../utils/customApiRespose.js"
import { asyncHandler } from "../utils/asyncHandlers.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


// done
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const getvideos = await Video.aggregate([

        // user find and same query

        {
            $match: {
                $and: [
                    { owner: mongoose.Schema.ObjectId(userId) },
                    { title: { $regix: query, $options: "i" } }
                ]
            }
        },

        // skip - pagination

        { $skip: skip },

        // limit 

        { $limit: parseInt(limit) },

        //sortBy likes

        { $sort: { [sortBy]: sortType === "desc" ? -1 : 1 } },






    ])

    return res.status(200)
        .json(
            new ApiResponse(200, getvideos, "videos successfully fetched of given used")
        )

})

// done
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video


    // get local path 

    const videoLocalPath = req?.files?.videoFile[0].filename
    const thumbnailLocalPath = req.files.thumbnail[0].filename

    if (!(videoLocalPath || thumbnailLocalPath)) { throw new ApiErrors(400, 'video is not uploaded') }

    // upload on cloudinary

    const video = await uploadOnCloudinary(videoLocalPath)
    if (!video) {
        throw new ApiErrors(400, "video uplaod failed")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new ApiErrors(400, "thumbnail uplaod failed")
    }

    await Video.create({
        title,
        description,
        videoFile: video.url,
        thumbnail: video.url,
        duration: video.duration

    })



})

// done
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
        throw new ApiErrors(400, "Video not found")
        const video = await Video.aggregate([
            { $match: { _id: videoId } }
        ])

        if (!video) {
            throw new ApiErrors(400, "Video not found")

        }
        res.status(200)
            .json(ApiResponse(200, video, "video get successuly"))

    }
})

// done
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    //TODO: update video details like title, description, thumbnail

    const localThumbnailPath = req.file.filename
    const updatedThumbnail = await uploadOnCloudinary(localThumbnailPath)

    await Video.findOneAndUpdate(
        { _id: videoId },
        { $set: { title, description, thumbnail: updatedThumbnail.url } },
        { new: true }
    )

})

// done
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    await Video.findOneAndDelete({_id:videoId})
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiErrors(400, "video not found")
    }

    video.isPublished = !video.isPublished
    video.save({ validateBeforeSave: false })

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}