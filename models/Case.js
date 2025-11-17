  import mongoose from 'mongoose';

  // Define subdocument schema for documents
  const documentSchema = new mongoose.Schema(
    {
      name: String,
      url: String,
      // Where the file is hosted: 'cloudinary' or 'external' (manual URL)
      provider: {
        type: String,
        enum: ['cloudinary', 'external'],
        default: 'external',
      },
      // Provider-specific id (e.g., Cloudinary public_id) for management
      providerId: {
        type: String,
        default: null,
      },
      type: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    { _id: false }
  );

  // Define the Case schema - blueprint for court cases
  const caseSchema = new mongoose.Schema(
    {
      // Unique case number (e.g., "CASE-2025-001")
      caseNumber: {
        type: String,
        required: [true, 'Please provide a case number'],
        unique: true,
        trim: true,
      },

      // Case title/name (e.g., "Smith vs Johnson")
      title: {
        type: String,
        required: [true, 'Please provide a case title'],
        trim: true,
      },

      // Detailed description of the case
      description: {
        type: String,
        required: [true, 'Please provide case description'],
      },

      // Lawyer A - who created the case (plaintiff's lawyer)
      lawyerA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Lawyer A is required'],
      },

      // Lawyer B - who joins the case (defendant's lawyer)
      // Can be null initially until lawyer B joins
      lawyerB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },

      // Case status: "draft" -> "submitted" -> "in_hearing" -> "closed"
      status: {
        type: String,
        enum: ['draft', 'submitted', 'in_hearing', 'closed'],
        default: 'draft',
      },

      // Jurisdiction - which country's laws apply
      jurisdiction: {
        type: String,
        required: [true, 'Please specify jurisdiction'],
        default: 'India',
      },

      // Case category (e.g., "Civil", "Criminal", "Corporate")
      category: {
        type: String,
        required: [true, 'Please specify case category'],
        enum: ['Civil', 'Criminal', 'Corporate', 'Family', 'Property', 'Other'],
      },

      // Documents uploaded by Lawyer A
      documentsA: [documentSchema],

      // Documents uploaded by Lawyer B
      documentsB: [documentSchema],

      // AI Verdict - stored after judgment
      aiVerdict: {
        verdict: String, // "Favor of A", "Favor of B", "Neutral"
        reasoning: String, // Why AI decided this
        confidence: Number, // 0-100% confidence score
        decidedAt: Date,
      },

      // Track arguments made (max 5 per side after initial verdict)
      argumentsA: [
        {
          text: String,
          counter: String, // AI's response
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      argumentsB: [
        {
          text: String,
          counter: String, // AI's response
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      // Count arguments to enforce 5-argument limit
      argumentCountA: {
        type: Number,
        default: 0,
      },

      argumentCountB: {
        type: Number,
        default: 0,
      },
    },
    {
      // Auto-add createdAt and updatedAt
      timestamps: true,
    }
  );

  // Create and export the Case model
  const Case = mongoose.model('Case', caseSchema);

  export default Case;
