import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";
const PORT = process.env.PORT || 8000;

dotenv.config({
  path: "./env",
});

app.on("error", (error)=>{
  console.log("ERROR", error);
  throw error
})


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running on port  ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("mongodb connection failed !!", error);
  });
