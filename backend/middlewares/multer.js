import multer from "multer";


export const upload =
  multer({
    storage:multer.memoryStorage(),
    limits: {fileSize:5 * 1024 * 1024}, // 5MB

    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF and DOCX allowed"), false);
      }
    },

  });