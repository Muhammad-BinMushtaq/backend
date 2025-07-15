import express from 'express'
import mongoose from 'mongoose'
import { Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true
        },

        thumbnail: {
            type: String,
            required: true
        },

        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        views: {
            type: String,
            default: 0,
            required: true
        },
        duration: {
            type: String,
            default: 0,
            required: true
        },

        owner: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        isPublished: {
            type: Boolean,
            required: true
        },
    },

    { timestamps: true }


)

videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video", videoSchema)