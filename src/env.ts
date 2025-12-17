import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 8080),
  databaseUrl: process.env.DATABASE_URL || "",
  ippanelApiKey: process.env.IPPANEL_API_KEY || "",
  ippanelOriginator: process.env.IPPANEL_ORIGINATOR || "",
  ippanelBaseUrl: process.env.IPPANEL_BASE_URL || "https://edge.ippanel.com/v1",
  ippanelPatternCode: process.env.IPPANEL_PATTERN_CODE || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  contentCost: Number(process.env.CONTENT_COST || 1)
};
