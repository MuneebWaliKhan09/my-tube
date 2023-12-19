import multer from "multer";

// multer middlware for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // distination folder to stored the file
  },
  filename: function (req, file, cb) { //cb = callback
    cb(null, file.originalname); // we can aslo update the file name ex: save as random numbers  deffrent names
  },
});

export const upload = multer({ storage });
