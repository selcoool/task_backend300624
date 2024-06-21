import express from "express";
import {getAllComment,getAllCommentByImageId,addComment,deleteComment,updateComment} from "../controllers/commentController.js"
import { getDrive, uploadFilesMiddleware } from '../googleDrive.js';


const commentRouter = express.Router();

commentRouter.get("/tat-ca-binh-luan",getAllComment)

commentRouter.get("/thong-tin-binh-luan-dua-hinh-id/:hinh_id",getAllCommentByImageId)

commentRouter.post("/them-binh-luan", addComment)

commentRouter.delete("/xoa-binh-luan/:binh_luan_id", deleteComment)
commentRouter.put("/sua-binh-luan", updateComment)




export default commentRouter