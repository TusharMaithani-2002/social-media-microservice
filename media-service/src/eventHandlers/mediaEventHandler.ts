import { Media } from '../models/Media'
import { deleteMediafromCloudinary } from '../utils/cloudinary'
import { logger } from '../utils/logger'

const handlePostDeleted = async (event: {
  postId: string
  userId: string
  mediaIds: string[]
}) => {
  const { postId, mediaIds } = event

  try {
    const mediaToDelete = await Media.find({ publicId: { $in: mediaIds } })

    for (const media of mediaToDelete) {
      await deleteMediafromCloudinary(media.publicId)
      await Media.findByIdAndDelete(media._id)

      logger.info(
        `Deleted media ${media._id} associated with this deleted post ${postId}`,
      )
    }

    logger.info(`Processed deletion of media for post id ${postId}`)
  } catch (error) {
    logger.error('Error occurred while media deletion', error)
  }
}

export { handlePostDeleted }
