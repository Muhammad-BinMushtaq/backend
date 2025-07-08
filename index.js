import './src/config/env.config.js'

import express from 'express'
import {app} from './src/app.js'
import connect_DB from './src/db/index.js'




connect_DB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`server is running at http://localhost:${process.env.PORT}`)
        })
    })

    .catch((error) => {
        console.log("some error >>>>>", error)
    })