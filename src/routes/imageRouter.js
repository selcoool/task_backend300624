import express from "express";
import {getAllImage,addImage,deleteImage,updateImage,getOneImageWithUserByImageId,getOneImageWithCommentByImageId,getOneImageByUserId,findImageByImageName,saveImage,getAllSavedImageByUserId,isSavedImage,getAllImageByUserId} from "../controllers/imageController.js"
import { getDrive, uploadFilesMiddleware } from '../googleDrive.js';
import { verifyToken } from "../middlewares/verify_token.js";


const imageRouter = express.Router();

imageRouter.get("/tat-ca-hinh-anh",verifyToken,getAllImage)

imageRouter.get("/thong-tin-hinh-anh-cung-nguoi-tao-dua-hinh-id/:hinh_id",getOneImageWithUserByImageId)

imageRouter.get("/thong-tin-hinh-anh-cung-binh-luan-dua-hinh-id/:hinh_id",getOneImageWithCommentByImageId)

imageRouter.get("/thong-tin-hinh-anh-dua-nguoi-dung-id/:nguoi_dung_id",getOneImageByUserId)

imageRouter.get("/tim-kiem-hinh-anh-dua-ten-hinh", findImageByImageName)

imageRouter.post("/them-hinh-anh",uploadFilesMiddleware, addImage)

imageRouter.put("/sua-hinh-anh",uploadFilesMiddleware, updateImage)
imageRouter.delete("/xoa-hinh-anh/:hinh_id",verifyToken, deleteImage)


imageRouter.post("/luu-hinh-anh", saveImage)
imageRouter.get("/luu-hinh-anh-chua-dua-vao-hinh-anh-id/:hinh_id",verifyToken, isSavedImage)
imageRouter.get("/tat-ca-hinh-anh-da-luu-dua-nguoi-dung-id/:nguoi_dung_id",verifyToken, getAllSavedImageByUserId)
imageRouter.get("/tat-ca-hinh-anh-dua-nguoi-dung-id/:nguoi_dung_id",verifyToken, getAllImageByUserId)




export default imageRouter