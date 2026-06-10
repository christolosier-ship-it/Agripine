import { getMode, getVenomLevel } from "./modes.js";
import { persona } from "./persona.js";

export function buildPromptContext({ text, modeId, venomLevel }) {
  const mode = getMode(modeId);
  const venom = getVenomLevel(venomLevel);

  return {
    input: text.trim(),
    personaName: persona.name,
    mode,
    venom,
    constraints: {
      localOnly: true,
      simulated: true,
      futureWebLLMReady: true
    }
  };
}
