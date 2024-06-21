export const responseData=(status,response,typeRequest,data,message)=>{
    response.status(status).json({
        status:status,
        req:typeRequest,
        data:data,
        message:message
    });
}