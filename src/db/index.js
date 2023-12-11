import mongoose from  "mongoose";
import DB_NAME from "../constants.js";



const connectDB = async ()=>{
    try {
        const connect = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`DB connected ! \nDB Host : ${connect.connection.host}`);
    } catch (error) {
        console.log('mongodb connection failed', error);
        process.exit(1);
    }
}


export default connectDB;