import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
const commentSchema = new Schema({



    content: {
        type: String
    },

    video: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Videos"
        }

    ],

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }

},
    {
        timestamps: true
    })

commentSchema.plugin(mongooseAggregatePaginate)
export const Comment = mongoose.model("Comment", commentSchema)