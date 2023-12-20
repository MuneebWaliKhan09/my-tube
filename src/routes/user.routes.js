import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();



router.route("/registerUser").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/loginUser").post(loginUser);



// protected routes
// you can add more middlewares before actual route
router.route("/logoutUser").post(verifyJwt, logoutUser); 
router.route("/refresh-token").post(refreshAccessToken); 




export default router;
