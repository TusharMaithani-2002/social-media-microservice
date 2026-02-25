import mongoose from 'mongoose'
import { hash, verify } from 'argon2'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    try {
      this.password = await hash(this.password)
    } catch (error: any) {
      return next(error)
    }
  }
})

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  try {
    return verify(this.password, candidatePassword)
  } catch (error: any) {
    throw error
  }
}

userSchema.index({ username : 'text' })

const User = mongoose.model('User', userSchema)

export { User, userSchema }