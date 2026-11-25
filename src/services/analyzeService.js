/* eslint-disable */
// src/services/analyzeService.js
// Uses Groq free tier — console.groq.com

import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

// ── API Key from .env file ──
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

const ANALYSIS_PROMPT_TEMPLATE = `You are an expert AI system for skill intelligence and career analysis.

Your task is to analyze a user's resume and a job description.

IMPORTANT RULES:
- Return ONLY valid JSON (no text outside JSON)
- Do NOT include explanations outside JSON
- Do NOT wrap the response in markdown code blocks
- Be precise and structured
- match_score MUST be an integer between 0 and 100 (e.g. 40, not 0.4)

INPUT:
Resume:
{resume}

Job Description:
{jd}

TASK:
1. Extract skills from the resume
2. Extract required skills from the job description
3. Compare both and identify matching skills and missing skills (skill gaps)
4. Assign importance level to each missing skill: "high" | "medium" | "low"
5. Identify dependencies between skills (e.g. Machine Learning requires Python, Pandas)
6. Generate a learning path ordered from beginner to advanced
7. Provide a short reasoning summary — MUST be a non-empty string of 2-4 sentences

OUTPUT FORMAT (STRICT JSON, NO MARKDOWN, NO CODE BLOCKS):
{
  "resume_skills": ["", "", ""],
  "job_skills": ["", "", ""],
  "matching_skills": ["", "", ""],
  "missing_skills": [
    { "name": "", "priority": "high | medium | low", "reason": "" }
  ],
  "dependencies": [
    { "skill": "", "requires": ["", ""] }
  ],
  "learning_path": [
    { "step": 1, "skill": "", "description": "" }
  ],
  "match_score": 0,
  "summary": ""
}`

function spiral(i, count, radius = 6) {
  const angle = (i / count) * Math.PI * 3
  const height = (i / count - 0.5) * 10
  const r = radius * (0.5 + (i / count) * 0.5)
  return [Math.cos(angle) * r, height, Math.sin(angle) * r - 3]
}

function buildGraphData(analysis) {
  const allSkillNames = [
    ...new Set([
      ...analysis.matching_skills,
      ...analysis.missing_skills.map(s => s.name)
    ])
  ]

  const skills = allSkillNames.map((name, i) => {
    const isKnown = analysis.matching_skills.includes(name)
    const missingInfo = analysis.missing_skills.find(s => s.name === name)
    return {
      id: String(i + 1),
      label: name,
      group: 'skill',
      known: isKnown,
      pos: spiral(i, allSkillNames.length),
      priority: missingInfo?.priority || null,
      gapReason: missingInfo?.reason || null,
      nextStep: analysis.learning_path.find(lp => lp.skill === name)?.description || null,
    }
  })

  const edges = []
  analysis.dependencies.forEach(dep => {
    const sourceNode = skills.find(s => s.label === dep.skill)
    dep.requires.forEach(req => {
      const targetNode = skills.find(s => s.label === req)
      if (sourceNode && targetNode) {
        edges.push({ source: sourceNode.id, target: targetNode.id })
      }
    })
  })

  return { skills, edges }
}

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }
  return fullText
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

function cleanJSON(raw) {
  let cleaned = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1)
  }
  return cleaned
}

export async function analyzeSkills(resumeInput, jdText) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not found. Add VITE_GROQ_API_KEY to your .env file.')
  }

  let resumeText = ''

  if (resumeInput instanceof File) {
    const isPDF = resumeInput.name.toLowerCase().endsWith('.pdf')
    if (isPDF) {
      resumeText = await extractTextFromPDF(resumeInput)
    } else {
      resumeText = await readFileAsText(resumeInput)
    }
  } else {
    resumeText = resumeInput
  }

  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error('Could not extract text from resume. Please try a TXT file.')
  }

  const prompt = ANALYSIS_PROMPT_TEMPLATE
    .replace('{resume}', resumeText)
    .replace('{jd}', jdText)

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only API. Respond with valid JSON only. No markdown, no code blocks, no explanation. match_score must be an integer 0-100.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Groq API Error ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  const rawText = data.choices?.[0]?.message?.content

  if (!rawText) throw new Error('Empty response from Groq')

  const jsonText = cleanJSON(rawText)
  const analysis = JSON.parse(jsonText)

  // Normalize summary — guarantee the AI Insight panel always has text to show
  if (!analysis || typeof analysis !== 'object' || typeof analysis.summary !== 'string' || !analysis.summary.trim()) {
    analysis.summary = `${(analysis.matching_skills?.length ?? 0)} skills match your resume, ${(analysis.missing_skills?.length ?? 0)} skill gaps found.`
  }

  // Normalize match_score — convert decimal to percentage if needed
  if (analysis.match_score <= 1) {
    analysis.match_score = Math.round(analysis.match_score * 100)
  }

  const { skills, edges } = buildGraphData(analysis)

  return { analysis, skills, edges }
}