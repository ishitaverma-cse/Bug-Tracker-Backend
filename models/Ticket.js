import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Ticket title is required'],
            trim: true,
        },

        description: {
            type: String,
            required: [true, 'Ticket description is required'],
            trim: true,
        },

        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },

        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
            default: 'Open',
        },

        assignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Project ID is required'],
        },
    },
    {
        timestamps: true,
    }
)

const Ticket = mongoose.model('Ticket', ticketSchema)

export default Ticket
