// import { z } from 'zod'
// import { ObjectId } from 'mongodb'

import type { InferSchemaType } from 'mongoose'
import type { userSchema } from '../models/User.model'

// This is the preferred way, skip joi and create zod validations
// export const UserSchema = z.object({
//     username: z.string('Username is required.').min(3, 'Username must be atleast 3 characters.').max(50, 'Username must be less than or equal to 50 characters.'),
//     email: z.email('Invalid input email.'),
//     password: z.string('Password is required.').min(6, 'Password must be alteast 6 characters.')
// })

// export const userDbSchema = UserSchema.extend({
//     _id: z.instanceof(ObjectId),
//     createdAt: z.date(),
// })

// export type UserInput = z.infer<typeof UserSchema>
// export type UserDocument = z.infer<typeof userDbSchema>

export type User = InferSchemaType<typeof userSchema> & { _id: string }
