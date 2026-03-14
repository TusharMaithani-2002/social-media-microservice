import Joi from 'joi'

const validateCreatePost = (data: unknown) => {
  const schema = Joi.object({
    content: Joi.string().min(3).max(5000).required(),
    mediaIds: Joi.array<string>()
  })

  return schema.validate(data)
}

export { validateCreatePost }
