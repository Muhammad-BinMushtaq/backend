import express, { json, urlencoded } from 'express'
const app = express()
import dotenv from 'dotenv';
import connect_DB from './src/db/index.js'
import cors from 'cors'

dotenv.config()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(json({
    limit: "16kb"
}))

app.use(urlencoded({extended:true}))

app.get('/hello', (req, res) => {
    console.log("this is ip address", req.ips)
})

connect_DB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`server is running at http://localhost:${process.env.PORT}`)
        })
    })

    .catch((error) => {
        console.log("some error >>>>>", error)
    })