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
    'testdrive@valiant-epsilon-425811-v5.iam.gserviceaccount.com',
    null,
    '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCXFxbdplEwj2yh\nbDlsJysDSblstt6CKeGPhilXOFlbxNAmmDplSxcDap89IQ6YN59CnhG7IjV7zyZq\n4zTrdezh7bh5GqgO7+V0tcOHsyGZHKljYPORIcvYk7AUFTqRnuLcmRr77xD1cyfR\nKRAYzGiWF5OCK4iFOxaIjgFxl6aEPVRdi6ybrLxdyUzFl7vP45RUoyzcxG1mXFEy\nBg9Hq75g0N5VgarrcnmaYEkRNQh7Y+ZY4Z9OFRAv8/RmPR2Mg8o00OnBbZAbZn9Y\nAZ///ilpEvk/ruYIY5lDjoyM9RZb5wDl4Ld99y/Sv8Q14EXmM5Ic/Mede3iBh60c\nUeTlKjQ3AgMBAAECggEADquOltA9SzUXMR1BqL9Xgnw4ECw5XUi/vqB3hyEmMVji\nH70206WqLbS+ksA7mzVbYKvZwOJzcFAOxODGv04LRWyVitIMcKwuYASotZZZCXV/\npPHsSbKPCQ+zUF/h+J2wHVyTAtSVlZ+BcDedI9XvxGhe9DanN3h4maMK1NgKslre\ndW/kSFKUrhfVVRX2uW1DhLv1/9s42XHqzT8nctgYCp6rQQuOePM8zERBHOhFvFNV\nevQyiI/EKkrskMDoTrp7Akf0Wj+8hFoiG9TVlwhGZ5iIdLaMGsXBivBRuQC8nKlg\nqa15ZqOPTtR9M8FeahC9rLLIto++tglSqcgoR/a7sQKBgQDUk27yPHbBKc7zuX0T\nfX5jghB0M+bXp/VAtyzNF3qDlmo1WNHYoJ4YJdGUTCXmd4n2SudbQHRjzE0WXTgZ\ndHYer7533LjFnuiZC1Bs1fZixAPKCqqy1obFh3I9eVfPYpjJs/zO4H6tEd17vnTz\nClRhrFqUDLbyTAxHVhXA07rRdQKBgQC19ElXbFFuh7eWndjm1nWDWUkmheV38kTi\nppgqGoo17yt/4gxl1lxQ9DTo6lZXf16ZTlv+Lr0Zu71Vxi1/sliJPVeyQQSoa8Gu\nz0vJ5ldf392Js88yauNiqMB575pei9oqF0dsHFGtVBT/vyreGx8PEjwDSdYYEQ8D\n6osfzH4tewKBgAIckM6RMTDMBIVBQ2/NIFNGuHkfBtz/ix0gdK543DuwY8+x2SvI\ntKlSvtk1RG8cot8ycUfjxQQ0xFNDi8oc8Qtu/XpdU+yKno7eoObj3TWv8sWwA3AR\nV3dg2A6qROgHd7MROaKocjmv4r5W7vx3Ds2Fk8TCt5KClOCkh0TKFaH9AoGAFADw\nUzkoVrN6/ocKAo7PSop1XVPZH2+2HQjdr7tNOJK7wIp0fHmtmoTOkFC6/1GUb9xK\nhs5SodKfBSANfn13+FaTHpjBT1bRa0uE9IRrVLIC5BGtlMhliUIuLvmligFsEbaP\ndpZCcIDO8jLtHo/ywTBrAp2KeQjfErolY3CS6qMCgYAi3vjbce4SHI5S8PDkmpKk\n1Abu7JLctuFiaLt/9ViOTXh6pf6iTl1owDYiE9nYTVEqksOpxtwuZGubG/RrbcV/\nDy6sMygULeC0pWejzwOueYiaUGvTraRkn9w90+w1TZIlQHr0h+S7wx9ivrhflv2C\neQatOjI78NLRB1FBbXhmWA==\n-----END PRIVATE KEY-----\n',
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
