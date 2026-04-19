import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateInsights = async (tasks, transactions) => {
  try {
    const prompt = `
You are an AI productivity assistant.

Analyze the following user data and give:
1. Productivity insights
2. Task improvement suggestions
3. Financial advice (if applicable)

Tasks:
${JSON.stringify(tasks, null, 2)}

Transactions:
${JSON.stringify(transactions, null, 2)}

Respond in JSON format:
{
  "productivityScore": number,
  "insights": [string],
  "suggestions": [string]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    console.error("OpenAI Error:", error);
    return {
      productivityScore: 0,
      insights: ["AI analysis failed"],
      suggestions: []
    };
  }
};