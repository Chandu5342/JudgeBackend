# AI Judge - Backend API

This is the **backend API** for the **AI Judge Legal Case Management System**, built using **Node.js**, **Express**, **MongoDB**, and **JWT authentication**.

It supports **user authentication**, **case management**, **document handling**, **argument submission**, and **AI-powered verdict generation**.

---

## ✨ Features

### **User Authentication**
- User registration with email and password
- Login using JWT tokens
- Token-based authentication for protected routes
- Password hashing using bcryptjs
- User profile management

### **Case Management**
- Create new legal cases with comprehensive details
- Update case status (draft → submitted → in_hearing → closed)
- Join cases as Lawyer B
- Retrieve case details with populated lawyer information
- Manage case documents and arguments

### **Document Management**
- Upload documents (PDF, Word, images)
- Store external document URLs
- Organize documents by side (A and B)
- Support for Cloudinary integration (optional)
- Document metadata tracking

### **Argument Submission**
- Submit arguments during AI hearing
- Track argument count per side (max 5)
- Store argument content and metadata
- Associate arguments with sides (A or B)
- Retrieve all arguments for a case

### **AI Verdict Generation**
- Generate AI-powered verdicts using Google Gemini API
- Analyze case evidence and arguments
- Provide detailed reasoning and confidence scores
- Store verdict with case data
- Detect winner based on verdict analysis

### **Middleware & Security**
- JWT authentication middleware
- Error handling and validation
- CORS support for frontend communication
- Request validation
- Protected routes for authenticated users

---

## 📁 Folder Structure

```
backend/
├── controllers/           # Business logic for API endpoints
│   ├── authController.js  # Registration, login, profile
│   ├── caseController.js  # Case CRUD operations
│   ├── argumentController.js # Argument submission
│   └── verdictController.js # Verdict generation
│
├── models/                # MongoDB schemas
│   ├── User.js           # User schema with authentication
│   ├── Case.js           # Case schema with documents
│   └── Argument.js       # Argument schema
│
├── routes/                # Express route definitions
│   ├── authRoutes.js      # Auth endpoints
│   ├── caseRoutes.js      # Case endpoints
│   ├── argumentRoutes.js  # Argument endpoints
│   └── verdictRoutes.js   # Verdict endpoints
│
├── middleware/            # Custom middleware
│   ├── auth.js           # JWT verification middleware
│   └── errorHandler.js   # Global error handling
│
├── config/                # Configuration files
│   └── db.js             # MongoDB connection
│
├── server.js              # Server entry point
├── .env                   # Environment variables
├── package.json           # Dependencies
└── README.md              # This file
```

---

## 🛠️ Tech Stack

- **Node.js + Express.js** – Backend framework
- **MongoDB + Mongoose** – Database and ODM
- **JWT (jsonwebtoken)** – Authentication
- **bcryptjs** – Password hashing
- **Google Gemini API** – AI verdict generation
- **Cloudinary** – File storage (optional)
- **CORS** – Cross-Origin Resource Sharing
- **dotenv** – Environment management

---

## 🔑 Environment Configuration (.env)

Create a `.env` file in the `backend` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/aijudge
# or for MongoDB Atlas:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aijudge

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Server
PORT=5000
NODE_ENV=development

# Google Gemini API (for AI verdict)
GEMINI_API_KEY=your_google_gemini_api_key

# Cloudinary (optional, for file uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_secret

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## 📦 Installation & Running

### Prerequisites
- Node.js v16+ and npm
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key

### Install Dependencies
```bash
cd backend
npm install
```

### Run Development Server
```bash
npm run dev
```
The server will run on: `http://localhost:5000`

### Run Production Server
```bash
npm start
```

---

## 📚 API Endpoints

### **Authentication Routes** (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login and get JWT token | No |
| GET | `/profile` | Get logged-in user info | Yes |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "lawyerA",
  "phone": "1234567890",
  "barRegistration": "BAR123456"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

---

### **Case Routes** (`/api/cases`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/` | Get all cases (paginated) | Yes |
| POST | `/` | Create new case | Yes |
| GET | `/:id` | Get case details | Yes |
| PUT | `/:id` | Update case | Yes |
| POST | `/:id/join` | Join case as Lawyer B | Yes |
| POST | `/:id/documents` | Upload document | Yes |
| GET | `/:id/documents` | Get case documents | Yes |

**Create Case Request:**
```json
{
  "caseNumber": "CASE-2025-001",
  "title": "Smith vs Johnson",
  "description": "Property dispute case",
  "jurisdiction": "California",
  "category": "Property"
}
```

---

### **Argument Routes** (`/api/arguments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/` | Submit new argument | Yes |
| GET | `/:caseId` | Get all arguments for case | Yes |
| GET | `/count/:caseId` | Get argument count by side | Yes |

**Submit Argument Request:**
```json
{
  "caseId": "case_id_here",
  "content": "Argument text here",
  "side": "A"
}
```

---

### **Verdict Routes** (`/api/verdict`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/generate` | Generate AI verdict | Yes |
| GET | `/:caseId` | Get case verdict | Yes |

**Generate Verdict Request:**
```json
{
  "caseId": "case_id_here"
}
```

---

## 👤 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| chandu@gmail.com | 123456 | Lawyer A |
| honey@gmail.com | 123456 | Lawyer B |

---

## 🔐 Authentication

All protected routes require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5000/api/cases
```

---

## 📊 Database Schema

### **User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['lawyerA', 'lawyerB', 'judge']),
  phone: String,
  barRegistration: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Case Model**
```javascript
{
  caseNumber: String (unique),
  title: String,
  description: String,
  lawyerA: ObjectId (ref: User),
  lawyerB: ObjectId (ref: User),
  status: String (enum: ['draft', 'submitted', 'in_hearing', 'closed']),
  jurisdiction: String,
  category: String,
  documentsA: [DocumentSchema],
  documentsB: [DocumentSchema],
  argumentsA: [ArgumentSchema],
  argumentsB: [ArgumentSchema],
  aiVerdict: {
    verdict: String,
    reasoning: String,
    confidence: Number,
    decidedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### **Argument Model**
```javascript
{
  caseId: ObjectId (ref: Case),
  lawyerId: ObjectId (ref: User),
  side: String (enum: ['A', 'B']),
  content: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Deployment

### Deploy to Render
1. Create account on [Render.com](https://render.com)
2. Connect GitHub repository
3. Set environment variables in Render dashboard
4. Deploy

### Deploy to Railway
1. Create account on [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy

### Deploy to Heroku
```bash
npm install -g heroku
heroku login
heroku create your-app-name
git push heroku main
```

**Update environment variables on deployment platform** with production MongoDB URI and API keys.

---

## 🧪 Testing with Postman

### 1️⃣ Register a User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Lawyer",
  "email": "john@law.com",
  "password": "password123",
  "role": "lawyerA",
  "phone": "9876543210",
  "barRegistration": "BAR123456"
}
```

### 2️⃣ Login User
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@law.com",
  "password": "password123"
}
```
Response will include JWT token.

### 3️⃣ Get User Profile
```
GET http://localhost:5000/api/auth/profile
Authorization: Bearer <token>
```

### 4️⃣ Create Case
```
POST http://localhost:5000/api/cases
Authorization: Bearer <token>
Content-Type: application/json

{
  "caseNumber": "CASE-2025-001",
  "title": "Dispute Over Property",
  "description": "A dispute over ownership of property",
  "jurisdiction": "California",
  "category": "Property"
}
```

### 5️⃣ Get All Cases
```
GET http://localhost:5000/api/cases
Authorization: Bearer <token>
```

### 6️⃣ Get Case Details
```
GET http://localhost:5000/api/cases/<case_id>
Authorization: Bearer <token>
```

### 7️⃣ Submit Argument
```
POST http://localhost:5000/api/arguments
Authorization: Bearer <token>
Content-Type: application/json

{
  "caseId": "<case_id>",
  "content": "This is my argument",
  "side": "A"
}
```

### 8️⃣ Get Arguments for Case
```
GET http://localhost:5000/api/arguments/<case_id>
Authorization: Bearer <token>
```

### 9️⃣ Generate Verdict
```
POST http://localhost:5000/api/verdict/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "caseId": "<case_id>"
}
```

### 🔟 Get Verdict
```
GET http://localhost:5000/api/verdict/<case_id>
Authorization: Bearer <token>
```

---

## 🛠️ Troubleshooting

### Issue: MongoDB Connection Error
- Verify MongoDB is running locally
- Check `MONGO_URI` in `.env`
- For MongoDB Atlas, ensure IP is whitelisted

### Issue: JWT Token Invalid
- Token may have expired (30 days)
- Re-login to get new token
- Verify `JWT_SECRET` is same across requests

### Issue: Gemini API Error
- Check if `GEMINI_API_KEY` is valid
- Verify API is enabled in Google Cloud Console
- Check API quota limits

### Issue: CORS Errors
- Verify `FRONTEND_URL` in `.env`
- Check if backend is running
- Clear browser cache and cookies

---

## 📝 Notes

- All passwords are hashed using bcryptjs (salt rounds: 10)
- JWT tokens expire in 30 days
- Case arguments limited to 5 per side
- AI verdict uses Google Gemini API for analysis
- Proper error handling and validation on all endpoints

---

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

## 👨‍💻 Author

**Chandu** - Full Stack Developer

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

## Testing AI Judge
1. Create a case and obtain a JWT token (register & login).
2. POST to `/api/judge/:caseId/verdict` with optional body { "documentSummaries": [ { "name": "doc", "summary": "text..." } ] }
3. Response: AI stores `aiVerdict` in the case.
4. Lawyers can then POST to `/api/judge/:caseId/argument` with {"text":"My counter argument ..."}. The API enforces a max of 5 follow-ups (see `MAX_ARGUMENTS`).

## Notes
`config/llm.js` supports both OpenAI and a generic Gemini HTTP endpoint. To use Gemini:

1. Set `LLM_PROVIDER=gemini` in `.env`.
2. Set `GEMINI_ENDPOINT` to your Gemini/Vertex REST endpoint URL.
3. Set `GEMINI_API_KEY` to your API key.

The wrapper will convert chat-style `messages` into a single prompt and POST to `GEMINI_ENDPOINT` with `{ prompt, max_output_tokens, temperature }`. Responses vary by provider; the wrapper tries common response fields (`output_text`, `output[0].content`, `text`) and returns the textual output.
- For production, use a Secrets Manager for keys; `.env` should not be committed.
