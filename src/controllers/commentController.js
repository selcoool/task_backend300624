import initModels from "../models/init-models.js"
import sequelize from "../models/connect.js"
import { responseData } from '../helper/responseData.js'
import { Readable } from 'stream';
import { getDrive, uploadFilesMiddleware } from '../googleDrive.js'

let model = initModels(sequelize)



const getAllComment = async (req, res) => {

    try {

        let data_getAllComment = await model.binh_luan.findAll({
            // include: ['nguoi_dung','hinh'],
            include: [
                {
                   model: model.nguoi_dung,
                   as: 'nguoi_dung'
                },
                {
                    model: model.hinh_anh,
                    as: 'hinh'
                 }
            ],
            
            nest: true,

        });


        responseData("200", res, "get", data_getAllComment, "Đã lấy tất cả bình luân thành công")

    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ")
    }




}



const getAllCommentByImageId = async (req, res) => {

    try {

        const { hinh_id } = req.params;

        let data_getAllCommentByImageId = await model.binh_luan.findAll({
            where: { hinh_id: hinh_id },
            include:['hinh','nguoi_dung'],
            raw: true, nest: true,
        });


        responseData("200", res, "get", data_getAllCommentByImageId, "Đã lấy thông tin luận theo ID hình ảnh thành công")

    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ")
    }




}



const addComment = async (req, res) => {

    try {

        const { nguoi_dung_id, hinh_id, noi_dung } = req.body


        let data_User = await model.nguoi_dung.findOne({
            where: { nguoi_dung_id: nguoi_dung_id },
            raw: true, nest: true
        });

        if (!data_User) {
            return responseData("200", res, "post", data_User, "Không toàn tại người dùng này")
        }


        let data_Image = await model.hinh_anh.findOne({
            where: { hinh_id: hinh_id },
            raw: true, nest: true
        });

        if (!data_Image) {
            return responseData("200", res, "post", data_Image, "Không toàn tại hình ảnh dùng này")
        }



          let data_addComment = await model.binh_luan.create({
            nguoi_dung_id:nguoi_dung_id,
            hinh_id:hinh_id,
            ngay_binh_luan:new Date(),
            noi_dung:noi_dung
        });

        responseData("200", res, "post",data_addComment, "Đã thêm bình luận cho hình ảnh thành công")

       

    } catch (error) {
        responseData("400", res, "post", error.message, "Xảy ra lỗi nội bộ")
    }

}


const updateComment = async (req, res) => {

    try {

        const { binh_luan_id,nguoi_dung_id,hinh_id,noi_dung} = req.body;

      

        const data_Comment = await model.binh_luan.findOne({
            where: {
                binh_luan_id: binh_luan_id,
                nguoi_dung_id:nguoi_dung_id,
                hinh_id:hinh_id
            },
            raw: true, nest: true
        });

     

        if(data_Comment){
            const [data_updateComment] = await model.binh_luan.update({      
                    noi_dung:noi_dung,
                    ngay_binh_luan:new Date() 
                }, 
                {
                where: {
                    binh_luan_id: binh_luan_id,
                    nguoi_dung_id:nguoi_dung_id,
                    hinh_id:hinh_id
                },
            });

            responseData("200", res, "put",data_updateComment, "Đã chỉnh sửa bình luận thành công")
            

        } else {
            responseData("200", res, "put", null, "Đã không chỉnh sửa bình luận thành công")

        }


    } catch (error) {
        responseData("400", res, "put", error.message, "Xảy ra lỗi nội bộ")
    }

}





const deleteComment = async (req, res) => {

    try {

        const { binh_luan_id} = req.params;

        const data_deleteComment = await model.binh_luan.destroy({
            where: {
                binh_luan_id: binh_luan_id

            },
            raw: true, nest: true
        });



        responseData("200", res, "delete",data_deleteComment, "Đã xóa bình luận thành công")

       

    } catch (error) {
        responseData("400", res, "delete", error.message, "Xảy ra lỗi nội bộ")
    }

}









export {
    getAllComment,getAllCommentByImageId,addComment,deleteComment,updateComment
}