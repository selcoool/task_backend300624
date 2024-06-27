
import express from 'express'
import cors from 'cors'
import rootRouter from './routes/index.js'
import dotenv from 'dotenv'
var app=express()
dotenv.config();
const port = process.env.PORT || 3001

var  corsOptions  = {
  origin:["https://thegioimauxanh.com","http://localhost:3000","https://peaceful-sunflower-941f16.netlify.app"], //frontend url
  credentials: true,
  allowedHeaders:'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
  exposedHeaders:'Content-Range, X-Content-Range'
}


app.use(cors(corsOptions));

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

app.use(rootRouter)


// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})