import type { RequestHandler } from 'express'
import { logger } from '../utils/logger'
import { uploadToCloudinary } from '../utils/cloudinary'
import { Media } from '../models/Media'

const uploadMedia: RequestHandler = async (req, res) => {
  logger.info('Starting media upload')

  try {
    if (!req.file) {
      logger.error('File not found')
      return res.status(400).json({
        success: false,
        message: 'File not found',
      })
    }

    const { originalname, mimetype } = req.file
    const userId = req.user?.userId

    logger.info(`File details: name=${originalname}, type=${mimetype}`)
    logger.info('Upload to cloudinary starting...')

    console.log(req.file.mimetype)
    console.log(req.file.originalname)
    console.log(req.file.size)

    const result = await uploadToCloudinary(req.file)
    logger.info(`Cloudinary upload successful. Public Id: ${result.public_id}`)

    const newlyCreatedMedia = new Media({
      publicId: result.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: result.secure_url,
      userId,
    })

    await newlyCreatedMedia.save()

    res.status(201).json({
      success: true,
      mediaId: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: 'Media upload is successful',
    })
  } catch (error) {
    logger.error('Error uploading media', error)
    res.status(500).json({
      success: false,
      message: 'Error uploading media',
    })
  }
}

const getAllMedias: RequestHandler = async (req, res) => {
  try {
    const results = await Media.find({})
    return res.json({ results })
  } catch (error) {
    logger.error('Error uploading media', error)
    res.status(500).json({
      success: false,
      message: 'Error uploading media',
    })
  }
}

export { uploadMedia, getAllMedias }
