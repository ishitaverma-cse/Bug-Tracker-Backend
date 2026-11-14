import Comment from '../models/Comment.js'
import Ticket from '../models/Ticket.js'

// Add Comment
export const addComment = async (req, res) => {
    try {
        const { ticketId } = req.params
        const { text } = req.body

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: 'Comment text is required',
            })
        }

        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            return res.status(404).json({
                message: 'Ticket not found',
            })
        }

        const comment = await Comment.create({
            ticketId,
            userId: req.user.id,
            text: text.trim(),
        })

        const populatedComment = await Comment.findById(comment._id)
            .populate('userId', 'name email')

        return res.status(201).json({
            message: 'Comment added successfully',
            comment: populatedComment,
        })
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid ticket ID',
            })
        }

        return res.status(500).json({
            message: 'Failed to add comment',
            error: error.message,
        })
    }
}

// Get Comments By Ticket
export const getCommentsByTicket = async (req, res) => {
    try {
        const { ticketId } = req.params

        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            return res.status(404).json({
                message: 'Ticket not found',
            })
        }

        const comments = await Comment.find({ ticketId })
            .populate('userId', 'name email')
            .sort({ createdAt: 1 })

        return res.status(200).json({
            count: comments.length,
            comments,
        })
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid ticket ID',
            })
        }

        return res.status(500).json({
            message: 'Failed to fetch comments',
            error: error.message,
        })
    }
}
