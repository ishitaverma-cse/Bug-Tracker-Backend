import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'

import {
    addComment,
    getCommentsByTicket,
} from '../controllers/commentController.js'

const router = express.Router()

// Protect all Comment Routes
router.use(authMiddleware)

// Add Comment To Ticket
router.post('/:ticketId', addComment)

// Get Comments By Ticket
router.get('/:ticketId', getCommentsByTicket)

export default router
