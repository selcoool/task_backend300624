import jwt from 'jsonwebtoken'
import { responseData } from '../helper/responseData.js'
import dotenv from 'dotenv'
dotenv.config();

export const verifyToken =(req,res, next)=>{
//    const token= req.headers.authorization
//    console.log("token",token)
//    const accessToken= token.split(' ')[1]
//   jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) =>{
//     if (err) return notAuth('Access token may be expired or invalid',res)
//     req.user=user
//     next();
//     // console.log(token)
//   });

     if(req.headers.authorization){
    //    const accessToken=token.split(" ")[1]
    
   const accessToken=req.headers.authorization
    // console.log('HEADERS',accessToken)
       jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, function (err, user) {
        if (err) {
        //   return res.status(403).send({ message: "Token is invalid" });
          responseData("403", res, "get", err, "Token hết giá trị")
        }else{

          next()
        }
        
    
       
      });
        
    }else{
        // return res.status(404).json('The authemtication')
        responseData("404", res, "get", user, "Quyền truy cập")
    }

}


