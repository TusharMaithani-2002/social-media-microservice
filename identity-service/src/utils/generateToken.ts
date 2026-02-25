import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import type { User } from '../types/user.types'
import { RefreshToken } from '../models/RefreshToken'

const generateTokens = async (user: Pick<User, 'username' | '_id'>) => {
  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '60m' },
  )

  const refreshToken = crypto.randomBytes(40).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // refresh token expires in 7 days

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt,
  })

  return { accessToken, refreshToken }
}

export { generateTokens }
