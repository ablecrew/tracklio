import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatWithAI = async ({ message, context }) => {
  try {
    const systemPrompt = `
You are Tracklio AI — a smart productivity assistant.

You help users with:
- Tasks management
- Finance tracking
- Productivity advice
- Time management

Be concise, helpful, and practical.

User Data Context:
${JSON.stringify(context, null, 2)}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("Chat AI Error:", error);
    return "AI is currently unavailable.";
  }
};