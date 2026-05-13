import OpenAI from "openai";

import { generateMentorReply } from "@/lib/scoring";

let client: OpenAI | null = null;

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function generateMentorAnswer(message: string) {
  const openai = getClient();

  if (!openai) {
    return generateMentorReply(message);
  }

  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.2",
      input: [
        {
          role: "system",
          content:
            "Ты ИИ-наставник образовательной платформы AI DataLab. Отвечай по-русски, простым языком, коротко и полезно для школьников и студентов. Объясняй термины аналитики данных, Python, визуализации и машинного обучения.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return response.output_text?.trim() || generateMentorReply(message);
  } catch {
    return generateMentorReply(message);
  }
}
