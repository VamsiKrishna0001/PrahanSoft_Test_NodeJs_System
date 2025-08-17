const multer = require('multer');
const { join } = require('path');
const { mkdirSync } = require('fs');

const UPLOAD_DIR = join(process.cwd(), 'uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});

function fileFilter(req, file, cb) {
  if (!/\.(xlsx|xls)$/i.test(file.originalname)) return cb(new Error('Only Excel files are allowed'));
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { upload, UPLOAD_DIR };