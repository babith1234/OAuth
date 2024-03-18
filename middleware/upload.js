const multer = require('multer');
const { v2: cloudinary } = require('cloudinary').uploader;
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage });

module.exports = upload;