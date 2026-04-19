import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeTasksWithAI = async (tasks) => {
  try {
    const prompt = `
You are a productivity AI assistant.

Analyze the following tasks and return:
1. Productivity score (0–100)
2. 3–5 short insights to help improve productivity

Tasks:
${JSON.stringify(tasks)}

Respond ONLY in JSON format like:
{
  "productivityScore": number,
  "insights": ["insight1", "insight2"]
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a productivity expert." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;

    return JSON.parse(content);
  } catch (error) {
    console.error(error);
    return {
      productivityScore: 0,
      insights: ["AI analysis failed"]
    };
  }
};