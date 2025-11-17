import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// HELPER: Generate JWT token
// This token proves the user is authenticated
// Token expires in 30 days
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // Payload: what data to encode
    process.env.JWT_SECRET || 'your-secret-key', // Secret key to encode with
    { expiresIn: '30d' } // Token expires in 30 days
  );
};

// CONTROLLER: Register a new lawyer
export const register = async (req, res) => {
  try {
    
    // Get data from request body
    const { name, email, password, role, phone, barRegistration="" } = req.body;
    // Normalize role values for backward compatibility (accept 'lawyer')
    let normalizedRole = role;
    if (role === 'lawyer') normalizedRole = 'lawyerA';

    // VALIDATION: Check if all required fields exist
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // CHECK: Does user already exist?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }
console.log(name, email, password, role, phone, barRegistration)
    // CREATE: New user in database
    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole || 'lawyerA',
      phone,
      barRegistration,
    });
console.log("hello")
    // GENERAconsole.log("hello")TE: JWT token for this user
    const token = generateToken(user._id);

    // RESPONSE: Send back success with token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// CONTROLLER: Login an existing lawyer
export const login = async (req, res) => {
  try {
    // Get email and password from request
    const { email, password } = req.body;

    // VALIDATION: Check if email and password provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // FIND: User by email
    // .select('+password') because we set password to not show by default
    const user = await User.findOne({ email }).select('+password');

    // CHECK: User exists?
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // CHECK: Is password correct?
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // GENERATE: JWT token
    const token = generateToken(user._id);

    // RESPONSE: Send back token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// CONTROLLER: Verify if JWT token is valid
// This is used to check if a user is still logged in
export const verifyToken = async (req, res) => {
  try {
    // User info already set by authMiddleware
    // This endpoint just confirms token is valid
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user, // User info from middleware
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token verification failed',
      error: error.message,
    });
  }
};
