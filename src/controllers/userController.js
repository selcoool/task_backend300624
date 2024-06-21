import initModels from "../models/init-models.js"
import sequelize from "../models/connect.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { responseData } from '../helper/responseData.js'
import { Readable } from 'stream';
import { getDrive, uploadFilesMiddleware } from '../googleDrive.js'

let model = initModels(sequelize)



const getAllUser = async (req, res) => {

    try {

        let data_getAllUser = await model.nguoi_dung.findAll({
            
            include: ['hinh_anhs']
        });


        responseData("200", res, "get", data_getAllUser, "Đã lấy tất cả người dùng thành công")

    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ")
    }




}

const getOneUser = async (req, res) => {

    try {

        const { nguoi_dung_id } = req.params;

        let data_getOneUser = await model.nguoi_dung.findAll({
            where: { nguoi_dung_id: nguoi_dung_id },
            include: ['hinh_anhs'],
            raw: true, nest: true,
        });


        responseData("200", res, "get", data_getOneUser, "Đã lấy thông tin một người dùng thành công")

    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ")
    }




}

const generateAccessToken = (checkUser) => {
    return jwt.sign({
        nguoi_dung_id: checkUser.nguoi_dung_id,
        email: checkUser.email,
        mat_khau: checkUser.mat_khau,
        ho_ten: checkUser.ho_ten,
        tuoi: checkUser.tuoi,


    }, process.env.JWT_ACCESS_KEY, { expiresIn: '10s' })
}


const generateRefreshToken = (checkUser) => {
    return jwt.sign({
        nguoi_dung_id: checkUser.nguoi_dung_id,
        email: checkUser.email,
        mat_khau: checkUser.mat_khau,
        ho_ten: checkUser.ho_ten,
        tuoi: checkUser.tuoi,

    }, process.env.JWT_REFRESH_KEY, { expiresIn: '365d' })
}


const registerUser = async (req, res) => {
    try {

        const drive = getDrive();
        const { email, mat_khau, ho_ten, tuoi } = req.body
        const avartar = req.files?.anh_dai_dien;
  
        let data_User = await model.nguoi_dung.findOne({
            where: { email: email },
            raw: true, nest: true
        });

        if (data_User) {
            return responseData("200", res, "post", data_User, "Đã có người dùng đăng ký với email này")
        }

        if (avartar && avartar.length > 0) {

            // if (avartar != 'undefined' && avartar.length > 0) {
               

                for (const file of avartar) {
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
                        const hash = bcrypt.hashSync(mat_khau, 10)
                        let data_registerUser = await model.nguoi_dung.findOrCreate({
                            where: {
                                email: email,
                                mat_khau: hash,
                                ho_ten: ho_ten,
                                tuoi: tuoi,
                                anh_dai_dien: `https://drive.google.com/thumbnail?id=${response.data.id}`,

                            },
                            raw: true, nest: true
                        });
                        responseData("200", res, "post", data_registerUser, "Đã đăng ký người dùng thành công")

                    }   

                }

            // }else{




            // }






        } else if(avartar==undefined){
            const { anh_dai_dien,mat_khau, ...newDataBody } = req.body;

            const hash = bcrypt.hashSync(mat_khau, 10)
            let data_registerUser = await model.nguoi_dung.findOrCreate({
                where: {
                    ...newDataBody,
                     mat_khau:hash

                },
                raw: true, nest: true
            });
            responseData("200", res, "post", data_registerUser, "Đã đăng ký người dùng thành công")


        }   
        else {
            const hash = bcrypt.hashSync(mat_khau, 10)
            let data_registerUser = await model.nguoi_dung.findOrCreate({
                where: {
                    email: email,
                    mat_khau: hash,
                    ho_ten: ho_ten,
                    tuoi: tuoi
                },
                raw: true, nest: true
            });
            responseData("200", res, "post", data_registerUser, "Đã đăng ký người dùng thành công")
        }

    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ")
    }

}



const loginUser = async (req, res) => {

    try {



        const { email, mat_khau } = req.body

        let data_loginUser = await model.nguoi_dung.findOne({
            where: { email: email },
            raw: true, nest: true
        });

        // console.log("req.body",data_loginUser)
        if (data_loginUser == null) {
            return res.status(404).json({
                error: 1,
                message: 'Tên người dùng không đúng'
            })
        }

        const comparePassword = bcrypt.compareSync(mat_khau, data_loginUser.mat_khau)
       console.log("req.body",comparePassword)
        if (!comparePassword) {
            return res.status(404).json({
                error: 1,
                message: 'Mật khẩu chưa chính xác'
            })
        }

        const access_token = data_loginUser ? generateAccessToken(data_loginUser) : null;
        const refresh_token = data_loginUser ? generateRefreshToken(data_loginUser) : null;


        data_loginUser = { ...data_loginUser, access_token: access_token, refresh_token: refresh_token }

        if (access_token != null) {

            res.cookie('access_token', access_token, {
                // expires: new Date(
                //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
                // ),
                // httpOnly: true,
                // secure: true,
                // // sameSite: 'strict',
                // path: '/',
                // sameSite: "None"

       
                path: '/',
        secure: true,
        // sameSite: 'strict',
        sameSite: 'None'


     




            })

            res.cookie('refresh_token', refresh_token, {
                // expires: new Date (
                //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
                //     ),
                // httpOnly: true,
                // secure: true,
                // // 
                // path: '/',
                // sameSite: "None"


                path: '/',
        secure: true,
        // sameSite: 'strict',
        sameSite: 'None'


    



            })
        }

        responseData("200", res, "post", data_loginUser, "Đã đăng nhập thành công")

    } catch (error) {
        responseData("400", res, "get", error.message, "Xảy ra lỗi nội bộ")
    }

}


const updateUser = async (req, res) => {
    try {
        const drive = getDrive();
        const dataBody = req.body;
        const { nguoi_dung_id } = req.body;

        let avatar = req.files?.anh_dai_dien;
       

        // console.log('sssssssss',avatar &&  avatar.length>0)
        let data_User = await model.nguoi_dung.findOne({
            where: { 
                nguoi_dung_id: nguoi_dung_id 
            }
        });

        if (!data_User) {
            return responseData("400", res, "post", null, "Không tồn tại người dùng này");
        }

        if (avatar && avatar.length > 0) {

          
                for (const file of avatar) {
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
    
                    if (data_User.anh_dai_dien) {
                        const anh_dai_dien_id = data_User.anh_dai_dien.split('id=');
                        if (anh_dai_dien_id.length >= 2) {
                            await drive.files.delete({ fileId: anh_dai_dien_id.pop() });
                        }
                    }
    
                    const [data_updateUser] = await model.nguoi_dung.update(
                        { 
                            ...dataBody, 
                            anh_dai_dien: `https://drive.google.com/thumbnail?id=${response_create.data.id}`
                        }, 
                        {
                            where: {
                                nguoi_dung_id: nguoi_dung_id,
                           
                            },
                        }
                    );

                    if (data_updateUser == 1) {
                        let data_updatedUser = await model.nguoi_dung.findOne({
                            where: {
                                nguoi_dung_id: nguoi_dung_id,
                            },
                            raw: true,
                            nest: true
                        });
        
                     const access_token = data_updatedUser ? generateAccessToken(data_updatedUser) : null;
                    const refresh_token = data_updatedUser ? generateRefreshToken(data_updatedUser) : null;
        
                    if (access_token != null) {
        
                        res.cookie('access_token', access_token, {
                            expires: new Date(
                                Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
                            ),
                            path: '/',
                            secure: true,
                            sameSite: 'None'
                        })
        
                        res.cookie('refresh_token', refresh_token, {
                            // expires: new Date (
                            //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
                            //     ),
                            path: '/',
                            secure: true,
                            sameSite: 'None'
                        })
                    }
        
        
                    data_updatedUser = { ...data_updatedUser, access_token: access_token, refresh_token: refresh_token }
                        return responseData("200", res, "put", data_updatedUser, "Đã cập nhật thông tin thành công");
                    } else {
                        return responseData("400", res, "put", null, "Chưa cập nhật thông tin");
                    }

                    
    
                    return responseData("200", res, "post", data_updateUser, "Đã cập nhật người dùng thành công");
                }
           


        } 
        
        else if(avatar==undefined){

            const { anh_dai_dien, ...newDataBody } = dataBody;

            const [data_updateUser] = await model.nguoi_dung.update({ ...newDataBody }, {
                where: {
                    nguoi_dung_id: nguoi_dung_id,
            
                },
            });

            if (data_updateUser == 1) {
                let data_updatedUser = await model.nguoi_dung.findOne({
                    where: {
                        nguoi_dung_id: nguoi_dung_id
                    },
                    raw: true,
                    nest: true
                });

                     const access_token = data_updatedUser ? generateAccessToken(data_updatedUser) : null;
            const refresh_token = data_updatedUser ? generateRefreshToken(data_updatedUser) : null;

            if (access_token != null) {

                res.cookie('access_token', access_token, {
                    // expires: new Date(
                    //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
                    // ),
                    // httpOnly: true,
                    // secure: true,
                    // // // sameSite: 'strict',
                    // path: '/',
                    // sameSite: "None"

                    path: '/',
                    secure: true,
                    sameSite: 'strict',
                    // sameSite: 'None'

                })

                res.cookie('refresh_token', refresh_token, {
                    // expires: new Date (
                    //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
                    //     ),
                    // httpOnly: true,
                    // secure: true,
                    // // // sameSite: 'strict',
                    // path: '/',
                    // sameSite: "None"

                    path: '/',
                    secure: true,
                    sameSite: 'strict',
                    // sameSite: 'None'
                })
            }


            data_updatedUser = { ...data_updatedUser, access_token: access_token, refresh_token: refresh_token }
                return responseData("200", res, "put", data_updatedUser, "Đã cập nhật thông tin thành công");
            } else {
                return responseData("400", res, "put", null, "Chưa cập nhật thông tin");
            }

           
        } 
        else {
            const [data_updateUser] = await model.nguoi_dung.update({ ...dataBody }, {
                where: {
                    nguoi_dung_id: nguoi_dung_id,
                    email: email
                },
            });

            if (data_updateUser == 1) {
                let data_updatedUser = await model.nguoi_dung.findOne({
                    where: {
                        nguoi_dung_id: nguoi_dung_id,
                        email: email
                    },
                    raw: true,
                    nest: true
                });

              const access_token = data_updatedUser ? generateAccessToken(data_updatedUser) : null;
            const refresh_token = data_updatedUser ? generateRefreshToken(data_updatedUser) : null;

            if (access_token != null) {

                res.cookie('access_token', access_token, {
                    expires: new Date(
                        Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true,
                    secure: true,
                    // // sameSite: 'strict',
                    path: '/',
                    sameSite: "None"
                })

                res.cookie('refresh_token', refresh_token, {
                    // expires: new Date (
                    //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
                    //     ),
                    httpOnly: true,
                    secure: true,
                    // // sameSite: 'strict',
                    path: '/',
                    sameSite: "None"
                })
            }


            data_updatedUser = { ...data_updatedUser, access_token: access_token, refresh_token: refresh_token }
                return responseData("200", res, "put", data_updatedUser, "Đã cập nhật thông tin thành công");
            } else {
                return responseData("400", res, "put", null, "Chưa cập nhật thông tin");
            }
        }
    } catch (error) {
        return responseData("400", res, "put", error.message, "Xảy ra lỗi nội bộ");
    }
};



const deleteUser = async (req, res) => {
    try {
        const drive = getDrive();


        const { nguoi_dung_id, email } = req.params;

        const data_User = await model.nguoi_dung.findOne({
            where: {
                nguoi_dung_id: nguoi_dung_id

            },
        });

        if (data_User) {


            if (data_User && data_User.anh_dai_dien) {
                const anh_dai_dien_id = data_User.anh_dai_dien.split('id=');
                if (anh_dai_dien_id.length >= 2) {
                    const data_avatar = await drive.files.delete({ fileId: anh_dai_dien_id.pop() });
                }
            } else {
               
                responseData("400", res, "delete", null, "Người dùng không có ảnh đại diện hoặc không tìm thấy người dùng");
            }

        
            const data_deleteUser = await model.nguoi_dung.destroy({
                where: {
                    nguoi_dung_id: nguoi_dung_id
                },
            })
            responseData("200", res, "delete", null, "Đã xóa người dùng thành công")

        } else {
            responseData("200", res, "delete", null, "Không tìm thấy người dùng")

        }



        // The rest of your code for deletion and response handling
    } catch (error) {
        responseData("400", res, "delete", error.message, "Xảy ra lỗi nội bộ");
    }
};



const signOutUser = async (req, res) => {
    try {
        await res.clearCookie('access_token')
        await res.clearCookie('refresh_token')
        responseData("200", res, "post", null, "Đã đăng xuất thành công")
    } catch (error) {
        responseData("400", res, "post", null, "Chưa đăng xuất")

    }


}




const requestRefreshToken = async (req, res) => {
    try {
        // const refreshToken = req.body.refreshToken

        // console.log("refresh_Tokeneeeeeeeeeeeeeeeeeeee",req.body)
 
        const refresh_Token = req.body.refresh_token

       console.log("refresh_Token 222222222",refresh_Token)
        jwt.verify(refresh_Token, process.env.JWT_REFRESH_KEY, function (err, user) {

                    
            // console.log('err',err)
            // console.log('user',user)

            if (err) {
                // return res.status(404).json('Access token đã sai hoặc không còn thời gian sử dụng')
                responseData("404", res, "post", null, "Access token đã sai hoặc không còn thời gian sử dụng")
    
              
            }else{



              
                const newAccessToken=generateAccessToken(user)
                const newRefreshToken=generateRefreshToken(user)

                if (newAccessToken != null) {

                    res.cookie('access_token', newAccessToken, {
                        // // expires: new Date(
                        // //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
                        // // ),
                        // httpOnly: true,
                        // secure: true,
                        // // // sameSite: 'strict',
                        // // path: '/',
                        // sameSite: "None"

                        
                        path: '/',
                        secure: true,
                        // sameSite: 'strict',
                        sameSite: 'None'

                    })
    
                    res.cookie('refresh_token', newRefreshToken, {
                        // // expires: new Date (
                        // //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
                        // //     ),
                        // httpOnly: true,
                        // secure: true,
                        // // // sameSite: 'strict',
                        // // path: '/',
                        // sameSite: "None"


                        path: '/',
                        secure: true,
                        // sameSite: 'strict',
                        sameSite: 'None'

                    })

                   const data_Token={access_token:newAccessToken,refresh_token:newRefreshToken }

                    responseData("200", res, "post", data_Token, "Đã cập nhật token thành công");

                }
           
    
         
    

            }
          
            
          
        });
       
        
    } catch (error) {
        responseData("400", res, "post", null, "Chưa đăng xuất")

    }


}




// export const requestRefreshToken  =(req,res)=>new Promise(async(resolve, reject)=>{
//     try {
        
//         // const refreshToken = req.cookies.refresh_token

//         const refreshToken = req.body.refresh_token
    
//        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, function (err, user) {
//         if (err) {
//             // return res.status(404).json('Access token đã sai hoặc không còn thời gian sử dụng')
//             responseData("404", res, "post", null, "Access token đã sai hoặc không còn thời gian sử dụng")

          
//         }
      
//         const newAccessToken=generateAccessToken(user)
//         const newRefreshToken=generateRefreshToken(user)
      

//         res.cookie('access_token', newAccessToken, {
//             // expires: new Date (
//             //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
//             //     ),
//             httpOnly: true,
//             secure: true,
//             // // sameSite: 'strict',
//             path: '/',
//             sameSite: "None"
//         })
        
//         res.cookie('refresh_token', newRefreshToken, {
//             // expires: new Date (
//             //     Date.now() + process.env.EXPIRE_IN * 24 * 60 * 60 * 1000
//             //     ),
//             httpOnly: true,
//             secure: true,
//             // // sameSite: 'strict',
//             path: '/',
//             sameSite: "None"
//         })

//         // resolve({
//         //     error:user ? 0 : 1, 
//         //     message:user ? 'Bạn đã yêu cầu access_token mới thành công' : 'Yêu cầu access_token thất bại, vui lòng kiểm tra lại',
//         //     access_token:newAccessToken ? `Bearer ${newAccessToken}`:null,
//         //     refresh_token:newRefreshToken ? `Bearer ${newRefreshToken}`:null
//         // })
//         // console.log(user)
//         // {
//         //     id: '64e5c73c63068380d6576094',
//         //     isAdmin: false,
//         //     iat: 1692789058,
//         //     exp: 1692789118
//         //   }

      
//     });

   
       
//     } catch (error) {
//          reject({
//             error:1, 
//             message:error
        
//         })
    
//     }
// })







export {
    getAllUser,getOneUser, registerUser, loginUser, updateUser, deleteUser, signOutUser,requestRefreshToken
}