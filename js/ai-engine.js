import { buildWebLLMMessages } from "./prompt-builder.js";
import { detectSensitiveRequest, getSafetyRedirect, sanitizeModelOutput } from "./safety-rules.js";
import { getModelStatus } from "./webllm-engine.js";
import { generateWithModel } from "./webllm-engine.js";

export async function generateAssistantResponse({ text, modeId, venomLevel, messages = [], onToken }) {
  if (detectSensitiveRequest(text)) {
    return {
      content: getSafetyRedirect(),
      blockedBeforeModel: true
    };
  }

  const status = getModelStatus();
  if (status.status !== "ready") {
    throw new Error("Agripine n’a pas encore fini de charger son mépris. Le modèle WebLLM est obligatoire en V0.2.0.");
  }

  const webLLMMessages = buildWebLLMMessages({ text, modeId, venomLevel, messages });
  const almostPolite = modeId === "almost-polite";

  try {
    const raw = await generateWithModel({
      messages: webLLMMessages,
      venomLevel,
      onToken: onToken
        ? (delta, fullText) => {
            onToken(delta, sanitizeModelOutput(fullText, { almostPolite }));
          }
        : undefined
    });

    return {
      content: sanitizeModelOutput(raw, { almostPolite }),
      blockedBeforeModel: false
    };
  } catch (error) {
    throw new Error(error?.message || "Mon cerveau local vient de trébucher dans ses propres câbles. Réessaie.");
  }
}
