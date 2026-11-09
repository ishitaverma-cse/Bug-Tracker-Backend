import Project from '../models/Project.js'
import User from '../models/User.js'

// Create Project
export const createProject = async (req, res) => {
    try {
        const { title, description } = req.body

        if (!title || !description) {
            return res.status(400).json({
                message: 'Title and description are required',
            })
        }

        const project = await Project.create({
            title,
            description,
            owner: req.user.id,
            teamMembers: [],
        })

        res.status(201).json({
            message: 'Project created successfully',
            project,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to create project',
            error: error.message,
        })
    }
}

// Get Projects
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { owner: req.user.id },
                { teamMembers: req.user.id },
            ],
        })
            .populate('owner', 'name email')
            .populate('teamMembers', 'name email')
            .sort({ createdAt: -1 })

        res.status(200).json({
            message: 'Projects fetched successfully',
            projects,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch projects',
            error: error.message,
        })
    }
}

 
// Update Project
export const updateProject = async (req, res) => {
    try {
        const { title, description } = req.body

        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.id,
        })

        if (!project) {
            return res.status(404).json({
                message: 'Project not found or unauthorized',
            })
        }

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    message: 'Project title cannot be empty',
                })
            }

            project.title = title.trim()
        }

        if (description !== undefined) {
            if (!description.trim()) {
                return res.status(400).json({
                    message: 'Project description cannot be empty',
                })
            }

            project.description = description.trim()
        }

        await project.save()

        res.status(200).json({
            message: 'Project updated successfully',
            project,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update project',
            error: error.message,
        })
    }
}


// Delete Project
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id,
        })

        if (!project) {
            return res.status(404).json({
                message: 'Project not found or unauthorized',
            })
        }

        res.status(200).json({
            message: 'Project deleted successfully',
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete project',
            error: error.message,
        })
    }
}

 
// Add Team Member
export const addTeamMember = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                message: 'Member email is required',
            })
        }

        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.id,
        })

        if (!project) {
            return res.status(404).json({
                message: 'Project not found or unauthorized',
            })
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        })

        if (!user) {
            return res.status(404).json({
                message: 'User not found. Please check the email.',
            })
        }

        // Prevent adding project owner as a member
        if (user._id.toString() === project.owner.toString()) {
            return res.status(400).json({
                message: 'Project owner is already part of the project',
            })
        }

        // Prevent duplicate members
        if (project.teamMembers.includes(user._id)) {
            return res.status(409).json({
                message: 'User is already a team member',
            })
        }

        project.teamMembers.push(user._id)

        await project.save()

        await project.populate('teamMembers', 'name email')

        res.status(200).json({
            message: 'Team member added successfully',
            project,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to add team member',
            error: error.message,
        })
    }
}


// Remove Team Member
export const removeTeamMember = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                message: 'Member email is required',
            })
        }

        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.id,
        })

        if (!project) {
            return res.status(404).json({
                message: 'Project not found or unauthorized',
            })
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        })

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            })
        }

        const isMember = project.teamMembers.some(
            (memberId) => memberId.toString() === user._id.toString()
        )

        if (!isMember) {
            return res.status(404).json({
                message: 'User is not a team member',
            })
        }

        project.teamMembers = project.teamMembers.filter(
            (memberId) => memberId.toString() !== user._id.toString()
        )

        await project.save()

        await project.populate('teamMembers', 'name email')

        res.status(200).json({
            message: 'Team member removed successfully',
            project,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to remove team member',
            error: error.message,
        })
    }
}


