import OpenAI from "openai";
import { env } from "../env";

export function getOpenAI() {
  return new OpenAI({ apiKey: env.openaiApiKey });
}
