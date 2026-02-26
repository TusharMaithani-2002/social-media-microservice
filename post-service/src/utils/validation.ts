import type { contentSecurityPolicy } from 'helmet'
import Joi from 'joi'

const validateCreatePost = (data: unknown) => {
  const schema = Joi.object({
    content: Joi.string().min(3).max(5000).required(),
  })

  return schema.validate(data)
}

export { validateCreatePost }
