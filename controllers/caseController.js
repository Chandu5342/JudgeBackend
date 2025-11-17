import Case from '../models/Case.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// HELPER: Generate unique case number
// Format: CASE-YYYY-XXXXX (e.g., CASE-2025-00001)
const generateCaseNumber = async () => {
  const year = new Date().getFullYear();
  const lastCase = await Case.findOne().sort({ createdAt: -1 });

  let number = 1;
  if (lastCase && lastCase.caseNumber) {
    const lastNumber = parseInt(lastCase.caseNumber.split('-')[2]);
    number = lastNumber + 1;
  }

  return `CASE-${year}-${String(number).padStart(5, '0')}`;
};

// CONTROLLER: Create a new case (Lawyer A initiates)
export const createCase = async (req, res) => {
  try {
    console.log("claig");
    // Get data from request body
    const { title, description, jurisdiction, category } = req.body;

    // VALIDATION: Check required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category',
      });
    }

    // GENERATE: Unique case number
    const caseNumber = await generateCaseNumber();

    // CREATE: New case in database
    const newCase = await Case.create({
      caseNumber,
      title,
      description,
      category,
      jurisdiction: jurisdiction || 'India',
      lawyerA: req.user._id, // Current user (authenticated via middleware)
    });

    // POPULATE: Replace IDs with actual user data
    await newCase.populate('lawyerA', 'name email');

    // RESPONSE: Send case details
    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: {
        case: newCase,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating case',
      error: error.message,
    });
  }
};

// CONTROLLER: Join an existing case (Lawyer B joins)
export const joinCase = async (req, res) => {
  try {
    // Get case ID from URL parameter
    const { caseId } = req.params;

    // FIND: Case by ID
    const caseData = await Case.findById(caseId).populate('lawyerA', 'name email').populate('lawyerB', 'name email');

    // CHECK: Case exists?
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    // CHECK: Is Lawyer B already assigned?
    if (caseData.lawyerB) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer B is already assigned to this case',
      });
    }

    // CHECK: Is current user trying to join their own case?
    if (caseData.lawyerA.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot join your own case as Lawyer B',
      });
    }

    // UPDATE: Assign Lawyer B
    caseData.lawyerB = req.user._id;
    caseData.status = 'submitted'; // Case moves to submitted status
    await caseData.save();

    // POPULATE: Get fresh data with user info
    await caseData.populate('lawyerB', 'name email');

    // RESPONSE: Send updated case
    res.status(200).json({
      success: true,
      message: 'Successfully joined case as Lawyer B',
      data: {
        case: caseData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining case',
      error: error.message,
    });
  }
};

// CONTROLLER: Get all cases for current user
export const getMyCases = async (req, res) => {
  try {
   
    // FIND: Cases where user is Lawyer A OR Lawyer B
    const cases = await Case.find({
      $or: [{ lawyerA: req.user._id }, { lawyerB: req.user._id }],
    })
      .populate('lawyerA', 'name email')
      .populate('lawyerB', 'name email')
      .sort({ createdAt: -1 });
 console.log("Fetching my cases from API");
    // RESPONSE: Send cases list
    res.status(200).json({
      success: true,
      message: 'Cases retrieved successfully',
      data: {
        totalCases: cases.length,
        cases: cases,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving cases',
      error: error.message,
    });
  }
};

// CONTROLLER: Get all public/all cases (for browsing)
export const getPublicCases = async (req, res) => {
  try {
    // Return all cases, newest first. If you want to filter (e.g., only open cases), adjust query.
    const cases = await Case.find()
      .populate('lawyerA', 'name email')
      .populate('lawyerB', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: 'Cases retrieved', data: { totalCases: cases.length, cases } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving cases', error: error.message });
  }
};

// CONTROLLER: Get single case details
export const getCaseDetails = async (req, res) => {
  try {
    // Get case ID from URL parameter
    const { caseId } = req.params;

    // FIND: Case by ID with all references populated
    const caseData = await Case.findById(caseId)
      .populate('lawyerA', 'name email phone barRegistration')
      .populate('lawyerB', 'name email phone barRegistration');

    // CHECK: Case exists?
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    // CHECK: Is current user part of this case?
    const isPartOfCase =
      caseData.lawyerA._id.toString() === req.user._id.toString() ||
      caseData.lawyerB?._id.toString() === req.user._id.toString();

    if (!isPartOfCase) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this case',
      });
    }

    // RESPONSE: Send case details
    res.status(200).json({
      success: true,
      message: 'Case details retrieved',
      data: {
        case: caseData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving case details',
      error: error.message,
    });
  }
};

// CONTROLLER: Add document to case
export const addDocument = async (req, res) => {
  try {
    const { caseId } = req.params;
    // Support two flows:
    // 1) multipart/form-data with file field `file` (handled by multer)
    // 2) JSON body with documentName, documentUrl, documentType

    const { documentName, documentUrl, documentType } = req.body;

    // FIND: Case by ID
    const caseData = await Case.findById(caseId);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    // DETERMINE: Which lawyer is uploading?
    let isLawyerA = caseData.lawyerA.toString() === req.user._id.toString();
    let isLawyerB = caseData.lawyerB?.toString() === req.user._id.toString();

    if (!isLawyerA && !isLawyerB) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this case',
      });
    }

    // Build document object depending on input
    let doc = null;

    // If a file was uploaded via multer, upload it to Cloudinary
    if (req.file) {
      const filePath = req.file.path;
      try {
        const uploadRes = await cloudinary.uploader.upload(filePath, {
          resource_type: 'auto',
        });

        // Remove temp file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        doc = {
          name: req.file.originalname,
          url: uploadRes.secure_url,
          type: req.file.mimetype,
          provider: 'cloudinary',
          providerId: uploadRes.public_id,
          uploadedAt: new Date(),
        };
      } catch (err) {
        // Cleanup temp file on error
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw err;
      }
    } else {
      // No file uploaded; require explicit URL information
      if (!documentName || !documentUrl || !documentType) {
        return res.status(400).json({
          success: false,
          message: 'Please provide documentName, documentUrl, and documentType when not uploading a file',
        });
      }

      doc = {
        name: documentName,
        url: documentUrl,
        type: documentType,
        provider: 'external',
        providerId: null,
        uploadedAt: new Date(),
      };
    }

    // Push to appropriate array
    if (isLawyerA) {
      caseData.documentsA.push(doc);
    } else {
      caseData.documentsB.push(doc);
    }

    // SAVE: Updated case
    await caseData.save();

    // RESPONSE: Send success
    res.status(200).json({
      success: true,
      message: 'Document added successfully',
      data: {
        case: caseData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding document',
      error: error.message,
    });
  }
};

// CONTROLLER: Update case status
export const updateCaseStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status } = req.body;

    // VALIDATION: Check status is valid
    const validStatuses = ['draft', 'submitted', 'in_hearing', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // FIND: Case
    const caseData = await Case.findById(caseId);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    // CHECK: Only Lawyer A can update status
    if (caseData.lawyerA.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only Lawyer A can update case status',
      });
    }

    // UPDATE: Status
    caseData.status = status;
    await caseData.save();

    // RESPONSE: Send updated case
    res.status(200).json({
      success: true,
      message: 'Case status updated',
      data: {
        case: caseData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating case status',
      error: error.message,
    });
  }
};
