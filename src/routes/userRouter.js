import express from "express";
import {getAllUser,getOneUser,registerUser,loginUser,updateUser,deleteUser,signOutUser,requestRefreshToken} from "../controllers/userController.js"
import { getDrive, uploadFilesMiddleware } from '../googleDrive.js';
import {verifyToken} from '../middlewares/verify_token.js'


const userRouter = express.Router();

userRouter.get("/tat-ca-nguoi-dung",verifyToken,getAllUser )
userRouter.get("/thong-tin-nguoi-dung/:nguoi_dung_id",getOneUser )
userRouter.post("/dang-ky",uploadFilesMiddleware, registerUser)
userRouter.post("/dang-nhap", loginUser)
userRouter.put("/cap-nhat",uploadFilesMiddleware, updateUser)
userRouter.delete("/xoa-nguoi-dung/:nguoi_dung_id", deleteUser)
userRouter.post("/dang-xuat", signOutUser)
userRouter.post("/lam-moi-token", requestRefreshToken)



export default userRouter