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
            include: ['nguoi_dung']
        });


        responseData("200", res, "get", data_getAllImage, "Đã lấy tất cả hình ảnh thành công")

    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ")
    }




}



const getOneImageByImageId = async (req, res) => {

    try {

        const { hinh_id } = req.params;

        let data_getOneImageByImageId= await model.hinh_anh.findAll({
            where: { hinh_id: hinh_id },
            include: ['binh_luans'],
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
            include: ['nguoi_dung'],
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

        let queryOptions = {};
        if (ten_hinh) {
            queryOptions = {
                where: {
                    ten_hinh: {
                        [Op.substring]: ten_hinh,
                    },
                },
            };
        }

        let data_findImageByImageName = await model.hinh_anh.findAll({queryOptions, include: ['nguoi_dung']});

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


// const updateImage = async (req, res) => {
//     try {
//         const drive = getDrive();
//         const dataBody = req.body;
//         const { nguoi_dung_id } = req.body;

//         const image = req.files?.duong_dan;
       

//         // console.log('sssssssss',avatar &&  avatar.length>0)
//         let data_Image = await model.hinh_anh.findOne({
//             where: { 
//                 email: email, 
//             }
//         });

//         if (!data_Image) {
//             return responseData("400", res, "post", null, "Không tồn tại hình ảnh này");
//         }

//         // if (image && image.length > 0) {

          
//         //         for (const file of avatar) {
//         //             const bufferStream = new Readable();
//         //             bufferStream.push(file.buffer);
//         //             bufferStream.push(null);
    
//         //             let response_create = await drive.files.create({
//         //                 requestBody: {
//         //                     name: file.originalname,
//         //                     parents: ["1q_oPecVEnB4_7V1HHOegwzaVmTNmFVx_"]
//         //                 },
//         //                 media: {
//         //                     mimeType: file.mimetype,
//         //                     body: bufferStream,
//         //                 },
//         //                 fields: '*'
//         //             });
    
//         //             if (data_User.anh_dai_dien) {
//         //                 const anh_dai_dien_id = data_User.anh_dai_dien.split('id=');
//         //                 if (anh_dai_dien_id.length >= 2) {
//         //                     await drive.files.delete({ fileId: anh_dai_dien_id.pop() });
//         //                 }
//         //             }
    
//         //             const [data_updateUser] = await model.nguoi_dung.update(
//         //                 { 
//         //                     ...dataBody, 
//         //                     anh_dai_dien: `https://drive.google.com/thumbnail?id=${response_create.data.id}`
//         //                 }, 
//         //                 {
//         //                     where: {
//         //                         nguoi_dung_id: nguoi_dung_id,
//         //                         email: email
//         //                     },
//         //                 }
//         //             );

//         //             if (data_updateUser == 1) {
//         //                 let data_updatedUser = await model.hinh_anh.findOne({
//         //                     where: {
//         //                         nguoi_dung_id: nguoi_dung_id,
//         //                         email: email
//         //                     },
//         //                     raw: true,
//         //                     nest: true
//         //                 });
        
//         //              const access_token = data_updatedUser ? generateAccessToken(data_updatedUser) : null;
//         //             const refresh_token = data_updatedUser ? generateRefreshToken(data_updatedUser) : null;
        
//         //             if (access_token != null) {
        
//         //                 res.cookie('access_token', access_token, {
//         //                     expires: new Date(
//         //                         Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
//         //                     ),
//         //                     httpOnly: true,
//         //                     secure: true,
//         //                     // // sameSite: 'strict',
//         //                     path: '/',
//         //                     sameSite: "None"
//         //                 })
        
//         //                 res.cookie('refresh_token', refresh_token, {
//         //                     // expires: new Date (
//         //                     //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
//         //                     //     ),
//         //                     httpOnly: true,
//         //                     secure: true,
//         //                     // // sameSite: 'strict',
//         //                     path: '/',
//         //                     sameSite: "None"
//         //                 })
//         //             }
        
        
//         //             data_updatedUser = { ...data_updatedUser, access_token: access_token, refresh_token: refresh_token }
//         //                 return responseData("200", res, "put", data_updatedUser, "Đã cập nhật thông tin thành công");
//         //             } else {
//         //                 return responseData("400", res, "put", null, "Chưa cập nhật thông tin");
//         //             }

                    
    
//         //             return responseData("200", res, "post", data_updateUser, "Đã cập nhật người dùng thành công");
//         //         }
           


//         // } 
        
//         // else if(image==undefined){

//         //     const { anh_dai_dien, ...newDataBody } = dataBody;

//         //     const [data_updateUser] = await model.hinh_anh.update({ ...newDataBody }, {
//         //         where: {
//         //             nguoi_dung_id: nguoi_dung_id,
//         //             email: email
//         //         },
//         //     });

//         //     if (data_updateUser == 1) {
//         //         let data_updatedUser = await model.hinh_anh.findOne({
//         //             where: {
//         //                 nguoi_dung_id: nguoi_dung_id,
//         //                 email: email
//         //             },
//         //             raw: true,
//         //             nest: true
//         //         });

//         //              const access_token = data_updatedUser ? generateAccessToken(data_updatedUser) : null;
//         //     const refresh_token = data_updatedUser ? generateRefreshToken(data_updatedUser) : null;

//         //     if (access_token != null) {

//         //         res.cookie('access_token', access_token, {
//         //             expires: new Date(
//         //                 Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
//         //             ),
//         //             httpOnly: true,
//         //             secure: true,
//         //             // // sameSite: 'strict',
//         //             path: '/',
//         //             sameSite: "None"
//         //         })

//         //         res.cookie('refresh_token', refresh_token, {
//         //             // expires: new Date (
//         //             //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
//         //             //     ),
//         //             httpOnly: true,
//         //             secure: true,
//         //             // // sameSite: 'strict',
//         //             path: '/',
//         //             sameSite: "None"
//         //         })
//         //     }


//         //     data_updatedUser = { ...data_updatedUser, access_token: access_token, refresh_token: refresh_token }
//         //         return responseData("200", res, "put", data_updatedUser, "Đã cập nhật thông tin thành công");
//         //     } else {
//         //         return responseData("400", res, "put", null, "Chưa cập nhật thông tin");
//         //     }

           
//         // } 
//         // else {
//         //     const [data_updateUser] = await model.nguoi_dung.update({ ...dataBody }, {
//         //         where: {
//         //             nguoi_dung_id: nguoi_dung_id,
//         //             email: email
//         //         },
//         //     });

//         //     if (data_updateUser == 1) {
//         //         let data_updatedUser = await model.nguoi_dung.findOne({
//         //             where: {
//         //                 nguoi_dung_id: nguoi_dung_id,
//         //                 email: email
//         //             },
//         //             raw: true,
//         //             nest: true
//         //         });

//         //       const access_token = data_updatedUser ? generateAccessToken(data_updatedUser) : null;
//         //     const refresh_token = data_updatedUser ? generateRefreshToken(data_updatedUser) : null;

//         //     if (access_token != null) {

//         //         res.cookie('access_token', access_token, {
//         //             expires: new Date(
//         //                 Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
//         //             ),
//         //             httpOnly: true,
//         //             secure: true,
//         //             // // sameSite: 'strict',
//         //             path: '/',
//         //             sameSite: "None"
//         //         })

//         //         res.cookie('refresh_token', refresh_token, {
//         //             // expires: new Date (
//         //             //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
//         //             //     ),
//         //             httpOnly: true,
//         //             secure: true,
//         //             // // sameSite: 'strict',
//         //             path: '/',
//         //             sameSite: "None"
//         //         })
//         //     }


//         //     data_updatedUser = { ...data_updatedUser, access_token: access_token, refresh_token: refresh_token }
//         //         return responseData("200", res, "put", data_updatedUser, "Đã cập nhật thông tin thành công");
//         //     } else {
//         //         return responseData("400", res, "put", null, "Chưa cập nhật thông tin");
//         //     }
//         // }
//     } catch (error) {
//         return responseData("400", res, "put", error.message, "Xảy ra lỗi nội bộ");
//     }
// };



export {
    getAllImage,getOneImageByImageId,getOneImageByUserId,addImage,deleteImage,updateImage,findImageByImageName
}