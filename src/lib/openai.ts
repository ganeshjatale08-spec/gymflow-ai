import OpenAI from 'openai'

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'placeholder',
  })
}

export async function generateAIResponse(
  systemPrompt: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return 'AI not configured. Please add OPENAI_API_KEY to environment variables.'
  }

  const openai = getOpenAI()
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: 'user', content: userMessage },
    ],
    max_tokens: 500,
    temperature: 0.7,
  })
  return response.choices[0]?.message?.content || 'Sorry, I could not process your request.'
}
