import express, { Schema } from 'express'
import mongoose, { model, mongo, Types } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true

    },

    userName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    watchHistory: {
        type: [
            {
                Types: mongoose.Schema.ObjectId,
                ref: "video"
            }

        ]
    },

    password: {
        type: String,
        required: true,
        trim: true
    },

    coverImage: {
        type: String,

    },

    refreshToken: {
        type: String
    }
}
    , { timestamps: true })


userSchema.pre("read", async function (next) {
    if (!isModified("password"))
        return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()


})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        id: this._id,
        userName: this.userName,
        email: this.email,
        fullName: this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET_KEY
        , { expiry: process.env.ACCESS_TOKEN_EXPIRY })
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        id: this._id,
        
    },
        process.env.REFRESH_TOKEN_SECRET_KEY
        , { expiry: process.env.REFRESH_TOKEN_EXPIRY })
}



export const User = mongoose.model("User", userModel)
