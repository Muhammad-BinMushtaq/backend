import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({

    // who is subscribing
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // to whom is being subscribed
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }


}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)