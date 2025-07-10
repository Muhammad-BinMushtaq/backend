import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "video"
        }

    ],

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

},
    {
        timestamps: true
    })


export const Playlist = mongoose.model("Playlist", playlistSchema)