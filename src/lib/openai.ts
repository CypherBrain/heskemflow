import OpenAI from "openai"

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      "מפתח OpenAI חסר. יש להוסיף OPENAI_API_KEY למשתני הסביבה."
    )
  }
  return new OpenAI({ apiKey })
}

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined
}

export function getOpenAI(): OpenAI {
  if (!globalForOpenAI.openai) {
    globalForOpenAI.openai = createOpenAIClient()
  }
  return globalForOpenAI.openai
}
