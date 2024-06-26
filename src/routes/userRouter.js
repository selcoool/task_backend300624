import express from "express";
import {getAllUser,getOneUser,registerUser,loginUser,updateUser,deleteUser,signOutUser,requestRefreshToken,updateUserInfor} from "../controllers/userController.js"
import { getDrive, uploadFilesMiddleware } from '../googleDrive.js';
import {verifyToken} from '../middlewares/verify_token.js'


const userRouter = express.Router();

userRouter.get("/tat-ca-nguoi-dung",verifyToken,getAllUser )
userRouter.get("/thong-tin-nguoi-dung/:nguoi_dung_id",verifyToken,getOneUser )
userRouter.post("/dang-ky",uploadFilesMiddleware, registerUser)
userRouter.post("/dang-nhap", loginUser)
userRouter.post("/cap-nhat",verifyToken,uploadFilesMiddleware, updateUser)
userRouter.put("/cap-nhat-thong-tin-nguoi-dung",uploadFilesMiddleware, updateUserInfor)
userRouter.delete("/xoa-nguoi-dung/:nguoi_dung_id",verifyToken, deleteUser)
userRouter.post("/dang-xuat", signOutUser)
userRouter.post("/lam-moi-token", requestRefreshToken)



export default userRouter