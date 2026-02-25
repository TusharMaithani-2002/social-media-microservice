import type { RequestHandler } from 'express'
import { logger } from '../utils/logger'
import { Post } from '../models/Post'

const createPost: RequestHandler = async (req, res) => {
  try {
    const { content, mediaIds } = req.body
    const newlyCreatedPost = new Post({
      user: req.user?.userId,
      content,
      mediaIds: mediaIds || [],
    })

    await newlyCreatedPost.save()
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
  } catch (error) {
    logger.error('Error deleting post', error)
    return res.status(500).json({
      success: false,
      message: 'Error creating post',
    })
  }
}

export { createPost, getAllPosts, getPost, deletePost }
