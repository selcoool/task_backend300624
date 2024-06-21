import express from "express";
import {getAllImage,addImage,deleteImage,updateImage,getOneImageByImageId,getOneImageByUserId,findImageByImageName} from "../controllers/imageController.js"
import { getDrive, uploadFilesMiddleware } from '../googleDrive.js';


const imageRouter = express.Router();

imageRouter.get("/tat-ca-hinh-anh",getAllImage)

imageRouter.get("/thong-tin-hinh-anh-dua-hinh-id/:hinh_id",getOneImageByImageId)

imageRouter.get("/thong-tin-hinh-anh-dua-nguoi-dung-id/:nguoi_dung_id",getOneImageByUserId)

imageRouter.get("/tim-kiem-hinh-anh-dua-ten-hinh", findImageByImageName)

imageRouter.post("/them-hinh-anh",uploadFilesMiddleware, addImage)

imageRouter.put("/sua-hinh-anh",uploadFilesMiddleware, updateImage)
imageRouter.delete("/xoa-hinh-anh/:hinh_id", deleteImage)
// imageRouter.put("/cap-nhat",uploadFilesMiddleware, updateImage)
// userRouter.post("/dang-nhap", loginUser)
// userRouter.delete("/xoa-nguoi-dung/:email/:nguoi_dung_id", deleteUser)
// userRouter.post("/dang-xuat", signOutUser)



export default imageRouter