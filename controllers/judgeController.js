import Case from '../models/Case.js';
import { callLLM } from '../config/llm.js';

const MAX_ARGUMENTS = parseInt(process.env.MAX_ARGUMENTS || '5');

// Helper: build messages for Gemini / LLM
const buildVerdictPrompt = (caseData, documentSummaries = []) => {
  const system = `You are an impartial legal judge trained on multiple jurisdictions. When asked for a mock verdict, return a concise JSON object (ONLY JSON) with these fields: verdict ("Favor of A", "Favor of B", or "Neutral"), confidence (0-100 number), reasoning (short text). Use the case facts and documents to reason. Be explicit about any assumptions.`;

  let user = `Case Title: ${caseData.title}
Description: ${caseData.description}
Category: ${caseData.category}
Jurisdiction: ${caseData.jurisdiction}\n`;

  if (documentSummaries?.length) {
    user += '\nDocuments (summaries):\n';
    documentSummaries.forEach((d, idx) => {
      user += `${idx + 1}. ${d.name} - ${d.summary}\n`;
    });
  } else {
    user += '\nNo document summaries were provided — use case facts only.\n';
  }

  user += '\nGive a verdict and reasoning, return only JSON as described above.';

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
};

// Utility: parse LLM response, stripping ```json ``` fences if present
const parseLLMResponse = (responseText) => {
  try {
    const clean = responseText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/```$/i, '')
      .trim();
    const parsed = JSON.parse(clean);

    // Ensure confidence is a number
    if (parsed.confidence !== undefined) {
      parsed.confidence = Number(parsed.confidence);
      if (isNaN(parsed.confidence)) parsed.confidence = 50; // fallback default
    } else {
      parsed.confidence = 50; // default if missing
    }

    return parsed;
  } catch (err) {
    return {
      verdict: 'Neutral',
      confidence: 50,
      reasoning: `Could not parse LLM response. Raw output: ${responseText}`,
    };
  }
};
// CONTROLLER: Get AI verdict
export const getVerdict = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { documentSummaries } = req.body;

    if (!caseId)
      return res.status(400).json({ success: false, message: 'caseId is required' });

    const caseData = await Case.findById(caseId)
      .populate('lawyerA', 'name email')
      .populate('lawyerB', 'name email');

    if (!caseData)
      return res.status(404).json({ success: false, message: 'Case not found' });

    const messages = buildVerdictPrompt(caseData, documentSummaries || []);

    let modelResponse;
    try {
      modelResponse = await callLLM(messages, { model: 'gemini-2.5-pro' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'LLM call failed', error: err.message });
    }

    const parsed = parseLLMResponse(modelResponse);

    caseData.aiVerdict = {
      verdict: parsed.verdict || 'Neutral',
      reasoning: parsed.reasoning || parsed.reason || '',
      confidence: parsed.confidence || parsed.conf || 0,
      decidedAt: new Date(),
    };

    await caseData.save();

    return res.status(200).json({ success: true, message: 'AI verdict generated', data: { aiVerdict: caseData.aiVerdict } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate verdict', error: error.message });
  }
};

// CONTROLLER: Submit argument and ask AI to reconsider
export const submitArgument = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { text } = req.body;

    if (!caseId || !text)
      return res.status(400).json({ success: false, message: 'caseId and text are required' });

    const caseData = await Case.findById(caseId)
      .populate('lawyerA', 'name email')
      .populate('lawyerB', 'name email');

    if (!caseData)
      return res.status(404).json({ success: false, message: 'Case not found' });

    const isLawyerA = caseData.lawyerA._id.toString() === req.user._id.toString();
    const isLawyerB = caseData.lawyerB?._id?.toString() === req.user._id.toString();

    if (!isLawyerA && !isLawyerB)
      return res.status(403).json({ success: false, message: 'You are not part of this case' });

    if (isLawyerA && caseData.argumentCountA >= MAX_ARGUMENTS)
      return res.status(403).json({ success: false, message: 'Maximum arguments reached for Lawyer A' });

    if (isLawyerB && caseData.argumentCountB >= MAX_ARGUMENTS)
      return res.status(403).json({ success: false, message: 'Maximum arguments reached for Lawyer B' });

    // Add argument
    const argumentEntry = { text, counter: '', timestamp: new Date() };
    if (isLawyerA) {
      caseData.argumentsA.push(argumentEntry);
      caseData.argumentCountA += 1;
    } else {
      caseData.argumentsB.push(argumentEntry);
      caseData.argumentCountB += 1;
    }

    await caseData.save();

    // Build LLM prompt
    const system = `You are an impartial legal judge trained on the jurisdiction. The AI previously gave a verdict and reasoning. A lawyer has submitted a follow-up argument. Re-evaluate the verdict and reasoning and return only JSON { verdict, confidence, reasoning }.`;

    const userContent = `Case: ${caseData.title}
Summary: ${caseData.description}
Previous AI verdict: ${caseData.aiVerdict?.verdict || 'No previous verdict'}
Previous reasoning: ${caseData.aiVerdict?.reasoning || ''}
New argument: ${text}`;

    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: userContent },
    ];

    let modelResponse;
    try {
      modelResponse = await callLLM(messages, { model: 'gemini-2.5-pro' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'LLM call failed', error: err.message });
    }

    const parsed = parseLLMResponse(modelResponse);

    // Update counter in latest argument
    if (isLawyerA) {
      caseData.argumentsA[caseData.argumentsA.length - 1].counter = parsed.reasoning || '';
    } else {
      caseData.argumentsB[caseData.argumentsB.length - 1].counter = parsed.reasoning || '';
    }

    // Update overall verdict
    caseData.aiVerdict = {
      verdict: parsed.verdict || caseData.aiVerdict?.verdict || 'Neutral',
      reasoning: parsed.reasoning || caseData.aiVerdict?.reasoning || '',
      confidence: parsed.confidence || caseData.aiVerdict?.confidence || 50,
      decidedAt: new Date(),
    };

    await caseData.save();

    return res.status(200).json({ success: true, message: 'Argument submitted and AI reconsidered', data: { case: caseData } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit argument', error: error.message });
  }
};
