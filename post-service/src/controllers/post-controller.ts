import type { Request, RequestHandler } from 'express'
import { logger } from '../utils/logger'
import { Post } from '../models/Post'
import { validateCreatePost } from '../utils/validation'

async function invalidatePostCache(req: Request, input: string) {
  const cachedKey = `post:${input}`
  await req.redisClient.del(cachedKey)
  const keys = await req.redisClient.keys('posts:*')

  if (keys.length > 0) {
    await req.redisClient.del(keys)
  }
}

const createPost: RequestHandler = async (req, res) => {
  logger.info('Create post endpoint hit')
  try {
    const { error } = validateCreatePost(req.body)

    if (error) {
      logger.warn('Validation error', error.details[0]?.message)
      return res
        .status(400)
        .json({ success: false, message: error.details[0]?.message })
    }

    const { content, mediaIds } = req.body
    const newlyCreatedPost = new Post({
      user: req.user?.userId,
      content,
      mediaIds: mediaIds || [],
    })

    await newlyCreatedPost.save()
    await invalidatePostCache(req, newlyCreatedPost._id.toString())
    logger.info('Post created successfully', newlyCreatedPost)
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
    })
  } catch (error) {
    logger.error('Error creating post', error)
    return res.status(500).json({
      success: false,
      message: 'Error creating post',
    })
  }
}

const getAllPosts: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const startIndex = (page - 1) * limit

    const cacheKey = `posts:${page}:${limit}`
    const cachedPosts = await req.redisClient.get(cacheKey)

    if (cachedPosts) {
      return res.status(200).json(JSON.parse(cachedPosts))
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)

    const totalNoOfPosts = await Post.countDocuments()

    const result = {
      posts,
      currenPage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      totalPosts: totalNoOfPosts,
    }

    // save posts in cache
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result))

    return res.json(result)
  } catch (error) {
    logger.error('Error fetching posts', error)
    return res.status(500).json({
      success: false,
      message: 'Error creating post',
    })
  }
}

const getPost: RequestHandler = async (req, res) => {
  try {
    const postId = req.params.id
    const cacheKey = `post:${postId}`

    const cachedPost = await req.redisClient.get(cacheKey)

    if (cachedPost) {
      return res.json(JSON.parse(cachedPost))
    }

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }

    await req.redisClient.setex(cacheKey, 3600, JSON.stringify(post))

    return res.json(post)
  } catch (error) {
    logger.error('Error fetching post', error)
    return res.status(500).json({
      success: false,
      message: 'Error creating post',
    })
  }
}

const deletePost: RequestHandler = async (req, res) => {
  try {
    const postId = req.params.id as string
    const post = await Post.findOneAndDelete({
      _id: postId,
      user: req.user?.userId,
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    await invalidatePostCache(req, postId)

    return res.status(200).json({
      success: true,
      message: 'Deleted post successfully',
    })
  } catch (error) {
    logger.error('Error deleting post', error)
    return res.status(500).json({
      success: false,
      message: 'Error creating post',
    })
  }
}

export { createPost, getAllPosts, getPost, deletePost }
