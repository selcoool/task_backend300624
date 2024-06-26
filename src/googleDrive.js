import { google } from 'googleapis';
import multer from 'multer';
import dotenv from 'dotenv'
dotenv.config();
const { memoryStorage } = multer;

const storage = memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedFormats = ['jpg', 'jpeg', 'png', 'rar'];
  const fileFormat = file.originalname.split('.').pop().toLowerCase();
  if (allowedFormats.includes(fileFormat)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
}).fields([
  { name: 'anh_dai_dien', maxCount: 1 },
  { name: 'duong_dan', maxCount: 10 }
]);

const uploadFilesMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Multer error occurred while uploading.' });
    } else if (err) {
      return res.status(400).json({ error: 'Invalid file format' });
    }
    next();
  });
};

let auth;
let drive;

const SCOPE = ["https://www.googleapis.com/auth/drive"];
const authorize = async () => {
  const jwtClient = new google.auth.JWT(
    JSON.parse(process.env.SERVICE_ACCOUNT).client_email,
    null,
    JSON.parse(process.env.SERVICE_ACCOUNT).private_key,
    SCOPE
  );
  await jwtClient.authorize();
  console.log('JWT client authorized');
  return jwtClient;
};

(async () => {
  auth = await authorize();
  drive = google.drive({ version: 'v3', auth });
})();

export const getDrive = () => drive;
export { uploadFilesMiddleware };
