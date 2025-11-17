import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the User schema - this is the blueprint for lawyer data in MongoDB
const userSchema = new mongoose.Schema(
  {
    // Lawyer's full name
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
    },

    // Lawyer's email - unique so no two lawyers can have same email
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },

    // Hashed password (never store plain text passwords!)
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries by default (security)
    },

    // Lawyer role: 'lawyerA' or 'lawyerB' (or 'judge' for admin)
    role: {
      type: String,
      enum: ['lawyerA', 'lawyerB', 'judge'],
      default: 'lawyerA',
    },

    // Phone number for contact
    phone: {
      type: String,
      default: null,
    },

    // Bar registration number (lawyer license)
    barRegistration: {
      type: String,
      default: null,
    },

    // Is account active? (for soft delete)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// MIDDLEWARE: Hash password before saving to database
// This runs automatically whenever we save a new user or update password
userSchema.pre('save', async function (next) {
  // Only hash password if it's new or been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt (random value to make hash stronger)
    // 10 = cost factor (higher = more secure but slower)
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// METHOD: Compare provided password with hashed password in database
// Used during login to verify if password is correct
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

export default User;
