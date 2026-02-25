import Joi from 'joi'

const validateRegistration = (data: unknown) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6),
  })

  return schema.validate(data)
}
const validateLogin = (data: unknown) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6),
  })

  return schema.validate(data)
}

export { validateRegistration, validateLogin }
