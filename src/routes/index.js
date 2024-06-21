import express from 'express'
import userRouter from './userRouter.js'
import imageRouter from './imageRouter.js'
import commentRouter from './commentRouter.js'

const rootRouter = express.Router()

rootRouter.use("/binh-luan",commentRouter)
rootRouter.use("/nguoi-dung",userRouter)
rootRouter.use("/hinh-anh",imageRouter)

export default rootRouter