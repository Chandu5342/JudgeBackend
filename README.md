# AI Judge Backend

This backend provides:
- User authentication (JWT)
- Case management
- File uploads to Cloudinary (config required)
- AI Judge endpoints (verdict & argument) using an LLM provider

## Environment variables (in `.env`)
Required:
- PORT=5000
- MONGODB_URI=<mongo-uri>
- JWT_SECRET=<jwt-secret>
- CLOUDINARY_CLOUD_NAME=<cloudinary-cloud>
- CLOUDINARY_API_KEY=<cloudinary-key>
- CLOUDINARY_API_SECRET=<cloudinary-secret>

LLM:
- LLM_PROVIDER= openai|gemini (set `gemini` to use Gemini/Vertex endpoint)
- OPENAI_API_KEY=<openai-key> (if using openai)
- GEMINI_ENDPOINT=<gemini-rest-endpoint> (if using Gemini/Vertex)
- GEMINI_API_KEY=<gemini-key> (API key for Gemini/Vertex)
- MAX_ARGUMENTS=5

## Endpoints
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify`
- Cases: `/api/cases` (create), `/api/cases/:caseId` (get), `/api/cases/:caseId/join` (join), `/api/cases/:caseId/documents` (add document), `/api/cases/:caseId/status` (update status)
- Upload: `/api/upload` (multipart/form-data file)
- AI Judge: `/api/judge/:caseId/verdict` (POST), `/api/judge/:caseId/argument` (POST)

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
