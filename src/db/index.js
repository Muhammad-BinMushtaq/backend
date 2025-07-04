import mongoose from "mongoose";
import { DB_NAME } from '../constants.js'


 const connect_DB = async () => {
    try {
      const db= await mongoose.connect(`${process.env.MONGODB_URI}/DB_NAME`)
      console.log(`connected at !! ${db.connection.host}`)

    } catch (error) {
        console.log("there is some error", error)
        process.exit(1)

    }

}

export default connect_DB