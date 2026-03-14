import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { logger } from './logger'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadToCloudinary = async (
  file: Express.Multer.File,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
      },
      (err, result) => {
        if (err) {
          logger.error('Error while uploading media to cloudinary', err)
          return reject(err)
        }

        if (!result) {
          return reject(new Error('Cloudinary upload returned no result'))
        }

        resolve(result)
      },
    )

    uploadStream.end(file.buffer)
  })

  // const result = await cloudinary.uploader.upload(
  //   `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
  // )

  // return result
}

const deleteMediafromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    logger.info('Media deleted successfully from cloud storage', publicId)
    return result
  } catch (error) {
    logger.error('Error deleting from cloudinary')
    throw error
  }
}

export { uploadToCloudinary, deleteMediafromCloudinary }
