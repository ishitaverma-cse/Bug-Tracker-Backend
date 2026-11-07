import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Register User
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        // Validate input fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required',
            })
        }

        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({
                message: 'Password must be between 8 and 128 characters',
            })
        }

        if (
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9]/.test(password) ||
            /\s/.test(password)
        ) {
            return res.status(400).json({
                message: 'Password must contain uppercase, lowercase, number and special character, without spaces',
            })
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase(),
        })

        if (existingUser) {
            return res.status(409).json({
                message: 'Email already registered',
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        })

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        // Send response
        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        })
    } catch (error) {
        console.error('Registration error:', error.message)

        return res.status(500).json({
            message: 'Server error during registration',
        })
    }
}


// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
            })
        }

        // Find user by email
        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        })

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password',
            })
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        )

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password',
            })
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        // Send response
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        })
    } catch (error) {
        console.error('Login error:', error.message)

        return res.status(500).json({
            message: 'Server error during login',
        })
    }
}

