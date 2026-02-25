import { model, Schema } from 'mongoose'

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaIds: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
)

// as we are making search as independent service this is not very important
postSchema.index({ content: 'text' }) // for searching on content

const Post = model('Post', postSchema)

export { Post }
