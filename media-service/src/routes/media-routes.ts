import express from 'express'
import multer from 'multer'
import { getAllMedias, uploadMedia } from '../controllers/media-controller'
import { authenticateRequest } from '../middlewares/authMiddleware'
import { logger } from '../utils/logger'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single('file')

// router.post(
//   '/upload',
//   authenticateRequest,
//   (req, res, next) => {
//     upload(req, res, (err) => {
//       if (err instanceof multer.MulterError) {
//         logger.error('Multer error while uploading', err)
//         return res.status(400).json({
//           message: 'Multer error while uplaoding',
//           error: err.message,
//           stack: err.stack,
//         })
//       } else if (err) {
//         logger.error('Unkown error while uploading', err)
//         return res.status(500).json({
//           message: 'Unkown error while uplaoding',
//           error: err.message,
//           stack: err.stack,
//         })
//       }

//       if (!req.file) {
//         return res.status(400).json({
//           message: 'No file found',
//         })
//       }

//       next()
//     })
//   },
//   uploadMedia,
// )

router.post(
  "/upload",
  authenticateRequest,
  upload,
  uploadMedia
)

router.get('/get', authenticateRequest, getAllMedias)

export { router }
