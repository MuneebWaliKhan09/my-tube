import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN, // it means your frontend url which can integrate with api
    credentials: true
}))


app.use(express.json({limit: "16kb"})) // accept json data ex: formdata || and limit means req limit 16kb before limit express uses the body-parser
app.use(express.urlencoded({extended: true, limit: "16kb"})) // accept url encoded data
app.use(express.static("public"))  // keep your static files in public folder 
app.use(cookieParser()) // access , set, remove cookie from user browser


//  import routes here
import userRouter from "./routes/user.routes.js"

// declear routes here
app.use("/api/v1/users", userRouter)


export { app };



