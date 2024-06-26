import initModels from "../models/init-models.js"
import sequelize from "../models/connect.js"
import { responseData } from '../helper/responseData.js'
import { Readable } from 'stream';
import { getDrive, uploadFilesMiddleware } from '../googleDrive.js'

import { Op } from 'sequelize'

let model = initModels(sequelize)



const getAllImage = async (req, res) => {

    try {

        let data_getAllImage = await model.hinh_anh.findAll({
            include: [
                {
                    model: model.nguoi_dung,
                    as: 'nguoi_dung'
                }
            ],
        });


        responseData("200", res, "get", data_getAllImage, "Đã lấy tất cả hình ảnh thành công")

    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ")
    }




}



const getOneImageWithUserByImageId = async (req, res) => {

    try {

        const { hinh_id } = req.params;

        let data_getOneImageByImageId= await model.hinh_anh.findAll({
            where: { hinh_id: hinh_id },
            include: [
              
                {
                    model: model.nguoi_dung,
                    as: 'nguoi_dung'
                }
                
            ],
          
            // include: ['binh_luans'],
            nest: true
        });

        if(data_getOneImageByImageId.length>0){
            responseData("200", res, "get", data_getOneImageByImageId, "Đã lấy thông tin hình ảnh dựa vào id ảnh thành công")
        }else{
            responseData("400", res, "get", null, "Thông tin hình ảnh dựa vào id ảnh không đúng")
        }


       

    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ")
    }




}


const getOneImageWithCommentByImageId = async (req, res) => {

    try {

        const { hinh_id } = req.params;

        let data_getOneImageByImageId= await model.hinh_anh.findAll({
            where: { hinh_id: hinh_id },
            include: [
                {
                   model: model.binh_luan,
                   as: 'binh_luans'
                }
                
                
            ],
          
            // include: ['binh_luans'],
            nest: true
        });


        responseData("200", res, "get", data_getOneImageByImageId, "Đã lấy thông tin hình ảnh dựa vào id ảnh thành công")

    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ")
    }




}


const getOneImageByUserId = async (req, res) => {

    try {

        const { nguoi_dung_id } = req.params;

        let data_getOneImageByImageId= await model.hinh_anh.findAll({
            where: { nguoi_dung_id: nguoi_dung_id },
            include: [
                {
                   model: model.nguoi_dung,
                   as: 'nguoi_dung'
                }
            ],
            // include: ['nguoi_dung'],
             nest: true,
        });


        responseData("200", res, "get", data_getOneImageByImageId, "Đã lấy thông tin hình ảnh dựa vào id ảnh thành công")

    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ")
    }




}



const findImageByImageName = async (req, res) => {
    try {
        const { ten_hinh } = req.query;

        console.log('ssssssssssssssss',ten_hinh)

        let queryOptions = {};
        
        if (ten_hinh) {
            queryOptions = {
                where: {
                    ten_hinh: {
                       
                        [Op.substring]: ten_hinh,
                    },
                },
                include: [
                    {
                       model: model.nguoi_dung,
                       as: 'nguoi_dung'
                    }
                ]
            };
        }

        let data_findImageByImageName = await model.hinh_anh.findAll(queryOptions);

        responseData("200", res, "get", data_findImageByImageName, "Đã lấy hình ảnh dựa tên hình ảnh thành công");
    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ");
    }
};



const addImage = async (req, res) => {

    try {

        const drive = getDrive();
      const { ten_hinh,mo_ta,nguoi_dung_id} = req.body
        const image = req.files?.duong_dan;
       
    
        if (image && image.length > 0) {

                for (const file of image) {
                    const bufferStream = new Readable();
                    bufferStream.push(file.buffer);
                    bufferStream.push(null);

                    const response = await drive.files.create({
                        requestBody: {
                            name: file.originalname,
                            parents: ["1q_oPecVEnB4_7V1HHOegwzaVmTNmFVx_"]
                        },
                        media: {
                            mimeType: file.mimetype,
                            body: bufferStream,
                        },
                        fields: '*'
                    });


                    if (response.data.id) {
                       
                        let data_addImage = await model.hinh_anh.create({
                            ten_hinh:ten_hinh,
                            mo_ta:mo_ta,
                            nguoi_dung_id:nguoi_dung_id,
                            duong_dan: `https://drive.google.com/thumbnail?id=${response.data.id}`
                        }, {
                            raw: true,
                            nest: true
                        });
                        responseData("200", res, "post", data_addImage, "Đã thêm hình ảnh thành công")

                    }   

                }

        


        } else if(image==undefined){
           

            const { duong_dan, ...newDataBody } = req.body;

            let data_addImage = await model.hinh_anh.create({
                ...newDataBody
            }, {
                raw: true,
                nest: true
            });
            responseData("200", res, "post", data_addImage, "Đã thêm hình ảnh thành công")


        }   
        else {
          
            let data_addImage = await model.hinh_anh.create({
                ten_hinh:ten_hinh,
                mo_ta:mo_ta,
                nguoi_dung_id:nguoi_dung_id,
            }, {
                raw: true,
                nest: true
            });
            responseData("200", res, "post", data_addImage, "Đã thêm hình ảnh thành công")
        }

    } catch (error) {
        responseData("400", res, "post", error.message, "Xảy ra lỗi nội bộ")
    }




}





const updateImage = async (req, res) => {
    try {
        const drive = getDrive();
        const { hinh_id,nguoi_dung_id,...dataBody} = req.body
          const image = req.files?.duong_dan;

        
        let data_Image = await model.hinh_anh.findOne({
            where: { 
                hinh_id:hinh_id,
                nguoi_dung_id: nguoi_dung_id 
            } ,
            raw: true, nest: true,
        });


        if (!data_Image) {
            return responseData("400", res, "put", null, "Không tồn tại hình ảnh này");
        }

        if (image && image.length > 0) {

          
                for (const file of image) {
                    const bufferStream = new Readable();
                    bufferStream.push(file.buffer);
                    bufferStream.push(null);
    
                    let response_create = await drive.files.create({
                        requestBody: {
                            name: file.originalname,
                            parents: ["1q_oPecVEnB4_7V1HHOegwzaVmTNmFVx_"]
                        },
                        media: {
                            mimeType: file.mimetype,
                            body: bufferStream,
                        },
                        fields: '*'
                    });
    
                    if (data_Image.duong_dan) {
                        const duong_dan_id = data_Image.duong_dan.split('id=');
                        if (duong_dan_id.length >= 2) {
                            await drive.files.delete({ fileId: duong_dan_id.pop() });
                        }
                    }
    
                    const [update_Image] = await model.hinh_anh.update(
                        { 
                            ...dataBody, 
                            duong_dan: `https://drive.google.com/thumbnail?id=${response_create.data.id}`
                        }, 
                        {
                            where: {
                                hinh_id:hinh_id,
                                nguoi_dung_id: nguoi_dung_id 
                           
                            },
                        }
                    );
                    
                    return responseData("200", res, "put", update_Image, "Đã cập nhật người dùng thành công");
                }
           


        } 
        
        else if(image==undefined){

            const { duong_dan, ...newDataBody } = dataBody;

            const [update_Image] = await model.hinh_anh.update({ ...newDataBody }, {
                where: {
                    hinh_id:hinh_id,
                    nguoi_dung_id: nguoi_dung_id 
            
                },
            });

            if (update_Image == 1) {
                let data_updatedImage = await model.hinh_anh.findOne({
                    where: {
                        hinh_id:hinh_id,
                        nguoi_dung_id: nguoi_dung_id 
                    },
                    raw: true,
                    nest: true
                });


                return responseData("200", res, "put", data_updatedImage, "Đã cập nhật hình ảnh thành công");
            } else {
                return responseData("400", res, "put", null, "Chưa cập nhật thông tin");
            }

           
        } 
        else {
            const [update_Image] = await model.hinh_anh.update({ ...dataBody }, {
                where: {
                    nguoi_dung_id: nguoi_dung_id,
                    email: email
                },
            });

            if (update_Image == 1) {
                let data_updateImage = await model.hinh_anh.findOne({
                    where: {
                        nguoi_dung_id: nguoi_dung_id,
                        email: email
                    },
                    raw: true,
                    nest: true
                });

                return responseData("200", res, "put", data_updateImage, "Đã cập nhật thông tin hình ảnh thành công");
            } else {
                return responseData("400", res, "put", null, "Chưa cập nhật thông tin");
            }
        }
    } catch (error) {
        return responseData("400", res, "put", error.message, "Xảy ra lỗi nội bộ");
    }
};



const deleteImage = async (req, res) => {
    try {
        const drive = getDrive();


        const { hinh_id} = req.params;
      

        const data_Image = await model.hinh_anh.findOne({
            where: {
                hinh_id: hinh_id,
    

            },
        });

        if (data_Image) {


            if (data_Image && data_Image.duong_dan) {
                const duong_dan_id = data_Image.duong_dan.split('id=');
                if (duong_dan_id.length >= 2) {
                    const data_avatar = await drive.files.delete({ fileId: duong_dan_id.pop() });
                }
            } else {
               
                responseData("400", res, "delete", null, "Người dùng không có ảnh đại diện hoặc không tìm thấy người dùng");
            }

        
            const data_deleteImage = await model.hinh_anh.destroy({
                where: {
                    hinh_id: hinh_id,
             
                },
            })
            responseData("200", res, "delete", null, "Đã xóa hình ảnh thành công")

        } else {
            responseData("200", res, "delete", null, "Không tìm thấy hình ảnh")

        }



        // The rest of your code for deletion and response handling
    } catch (error) {
        responseData("400", res, "delete", error.message, "Xảy ra lỗi nội bộ");
    }
};



const saveImage = async (req, res) => {
    try {
        const { hinh_id, nguoi_dung_id } = req.body;

        const data_Image = await model.hinh_anh.findOne({
            where: { hinh_id: hinh_id },
        });

        if (!data_Image) {
            return responseData(404, res, "post", null, "Không tìm thấy hình ảnh");
        }

        const data_User = await model.nguoi_dung.findOne({
            where: { nguoi_dung_id: nguoi_dung_id },
        });

        if (!data_User) {
            return responseData(404, res, "post", null, "Không tìm thấy người dùng");
        }
       

        if(data_User && data_Image){
            // const data_saveImage = await model.luu_anh.create({
            //     nguoi_dung_id: nguoi_dung_id,
            //     hinh_id: hinh_id,
            //     ngay_luu: new Date(),
            // });

            let existingRecord = await model.luu_anh.findOne({
                where: {
                    nguoi_dung_id: nguoi_dung_id,
                    hinh_id: hinh_id
                }
            });
            
            if (!existingRecord) {
                let data_saveImage = await model.luu_anh.create({
                    nguoi_dung_id: nguoi_dung_id,
                    hinh_id: hinh_id,
                    ngay_luu: new Date()
                });
                return responseData(200, res, "post", data_saveImage, "Đã lưu hình ảnh thành công");
            } else {
                return responseData(403, res, "post", null, "Hình ảnh đã được lưu trước đó");
            }
    
          
        }else{
            return responseData(404, res, "post", null, "Thông lưu không đúng");
        }
        
    } catch (error) {
        return responseData(500, res, "post", error.message, "Xảy ra lỗi nội bộ");
    }
};






const isSavedImage = async (req, res) => {
    try {
        const {  hinh_id } = req.params;

        // console.log('ssssssss',hinh_id)

        // const data_User = await model.nguoi_dung.findOne({
        //     where: { nguoi_dung_id: nguoi_dung_id },
        // });

        // if (!data_User) {
        //     return responseData(404, res, "post", null, "Không tìm thấy người dùng");
        // }
       

        let data_isSavedImage = await model.luu_anh.findAll({
            where: { hinh_id: hinh_id },
            include: [
                {
                    model: model.hinh_anh,
                    as: 'hinh'
                },
                {
                    model: model.nguoi_dung,
                    as: 'nguoi_dung'
                }
            ],
            nest: true
        });


       if(data_isSavedImage.length>0){

        return responseData(200, res, "post", data_isSavedImage, "Người dùng đã lưu hình ảnh với id này");

       }else{
        return responseData(400, res, "post", null, "Người dùng vẫn chưa lưu hình ảnh với id này");
       }

     

       


      


        
    } catch (error) {
        return responseData(500, res, "post", error.message, "Xảy ra lỗi nội bộ");
    }
};




const getAllSavedImageByUserId = async (req, res) => {
    try {
        const {  nguoi_dung_id } = req.params;

      
       

        let data_getAllSavedImageByUserId = await model.luu_anh.findAll({
            where: { nguoi_dung_id: nguoi_dung_id },
            include: [
                {
                    model: model.hinh_anh,
                    as: 'hinh'
                }
            ],
            nest: true
        });


      if(data_getAllSavedImageByUserId.length>0){
        return responseData(200, res, "get", data_getAllSavedImageByUserId, "Đã lấy danh sách tất cả ảnh người dùng đã lưu");
      }else{
        return responseData(400, res, "get", null, "Không tìm thấy hình ảnh người dùng đã lưu");
      }



       


      
ư

        
    } catch (error) {
        return responseData(500, res, "get", error.message, "Xảy ra lỗi nội bộ");
    }
};




const getAllImageByUserId = async (req, res) => {
    try {
        const {  nguoi_dung_id } = req.params;

      
       

        let data_getAllImageByUserId = await model.hinh_anh.findAll({
            where: { nguoi_dung_id: nguoi_dung_id },
            include: [
                {
                    model: model.nguoi_dung,
                    as: 'nguoi_dung'
                }
            ],
            nest: true
        });


      if(data_getAllImageByUserId.length>0){
        return responseData(200, res, "get", data_getAllImageByUserId, "Đã lấy danh sách tất cả ảnh người dùng đã lưu");
      }else{
        return responseData(400, res, "get", null, "Không tìm thấy hình ảnh người dùng đã lưu");
      }



       


      
ư

        
    } catch (error) {
        return responseData(500, res, "get", error.message, "Xảy ra lỗi nội bộ");
    }
};







export {
    getAllImage,getOneImageWithUserByImageId,getOneImageWithCommentByImageId,getOneImageByUserId,addImage,deleteImage,updateImage,findImageByImageName,saveImage,getAllSavedImageByUserId,isSavedImage,getAllImageByUserId
}