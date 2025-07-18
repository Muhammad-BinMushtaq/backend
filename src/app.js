import cookieParser from 'cookie-parser'
import express, { json, urlencoded } from 'express'
const app = express()
import cors from 'cors'

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(json({ limit: "16kb" }))
app.use(urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static("public"))

// import all routes

import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.router.js'

app.use("/api/v1/users", userRouter)
app.use("api/v1/video", videoRouter)

export { app }