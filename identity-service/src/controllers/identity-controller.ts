import type { RequestHandler } from 'express'
import { logger } from '../utils/logger'
import { validateLogin, validateRegistration } from '../utils/validation'
import { User } from '../models/User.model'
import { generateTokens } from '../utils/generateToken'
import { RefreshToken } from '../models/RefreshToken'
// user-registration
const registerUser: RequestHandler = async (req, res) => {
  logger.info('Registration endpoint hit')

  try {
    const { error } = validateRegistration(req.body)

    if (error) {
      logger.warn('Validation error', error.details[0]?.message)
      return res
        .status(400)
        .json({ success: false, message: error.details[0]?.message })
    }

    const { email, password, username } = req.body

    let user = await User.findOne({ $or: [{ email }, { username }] })

    if (user) {
      logger.warn('User already exists')
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' })
    }

    user = new User({ email, password, username })
    await user.save()
    logger.info('User saved successfully', user._id.toString())

    const { accessToken, refreshToken } = await generateTokens({
      _id: user._id.toString(),
      username: user.username,
    })

    res.status(201).json({
      message: 'User registered successfully',
      success: true,
      accessToken,
      refreshToken,
    })
  } catch (error: any) {
    logger.error('Registration error occured', error)

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
// user-login
const loginUser: RequestHandler = async (req, res) => {
  logger.info('Login endpoint hit...')

  try {
    const { error } = validateLogin(req.body)

    if (error) {
      logger.warn('Validation error', error.details[0]?.message)
      return res
        .status(400)
        .json({ success: false, message: error.details[0]?.message })
    }

    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      logger.warn(`Invalid user`)
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // validating user password
    const isValidPassword = await user?.comparePassword(password)
    if (!isValidPassword) {
      logger.warn(`Invalid password`)
      return res.status(400).json({
        success: false,
        message: 'Invalid password',
      })
    }

    const { refreshToken, accessToken } = await generateTokens({
      username: user.username,
      _id: user._id.toString(),
    })

    return res.json({
      accessToken,
      refreshToken,
      userId: user._id.toString(),
    })
  } catch (error) {
    logger.error('Login error occured', error)

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// refresh token
const refreshTokenUser: RequestHandler = async (req, res) => {
  logger.info('Refresh token end point hit...')

  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      logger.warn('Refresh token missing')
      return res.status(400).json({
        success: false,
        message: 'Refresh token missing',
      })
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn('Invalid or expired refresh token')

      return res.status(401).json({
        success: false,
        message: 'Internal server error',
      })
    }

    const user = await User.findById(storedToken.user)

    if (!user) {
      logger.warn('User not found')

      return res.status(400).json({
        success: false,
        message: 'User not found',
      })
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens({
        username: user.username,
        _id: user._id.toString(),
      })

    // delete old tokens

    await RefreshToken.deleteOne({ _id: storedToken._id })

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    logger.error('Refresh token error occured', error)

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
// logout
const logoutUser: RequestHandler = async (req, res) => {
  logger.info('Logout enpoint hit...')

  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      logger.warn('Refresh token missing')
      return res.status(400).json({
        success: false,
        message: 'Refresh token missing',
      })
    }

    await RefreshToken.deleteOne({ token: refreshToken })
    logger.info('Refresh token deleted for logout')

    return res.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    logger.error('Error while logging out', error)

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export { registerUser, loginUser, refreshTokenUser, logoutUser }
