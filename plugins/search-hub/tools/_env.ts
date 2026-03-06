/**
 * _env.ts - Environment loader and key validation for search-hub
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { Provider } from "./_types";

const ENV_PATH = join(process.env.HOME || "~", ".claude", ".env");

let envLoaded = false;
const envVars: Record<string, string> = {};

function loadEnv(): void {
  if (envLoaded) return;
  envLoaded = true;

  try {
    const content = readFileSync(ENV_PATH, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      envVars[key] = value;
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env not found — keys may still be in process.env
  }
}

const PROVIDER_KEYS: Record<Provider, string | null> = {
  tavily: "TAVILY_API_KEY",
  perplexity: "PERPLEXITY_API_KEY",
  gemini: null, // Uses OAuth, no API key needed
  exa: "EXA_API_KEY",
};

export function getKey(provider: Provider): string | undefined {
  loadEnv();
  const keyName = PROVIDER_KEYS[provider];
  if (!keyName) return undefined; // Provider doesn't need a key
  return process.env[keyName] || envVars[keyName];
}

export function isProviderAvailable(provider: Provider): boolean {
  loadEnv();
  if (provider === "gemini") {
    // Check if gemini CLI exists
    try {
      Bun.spawnSync(["which", "gemini"]);
      return true;
    } catch {
      return false;
    }
  }
  return !!getKey(provider);
}

export function getAvailableProviders(): Provider[] {
  loadEnv();
  const providers: Provider[] = ["tavily", "perplexity", "gemini", "exa"];
  return providers.filter(isProviderAvailable);
}

export function getProviderStatus(): Record<Provider, { available: boolean; reason?: string }> {
  loadEnv();
  const status: Record<string, { available: boolean; reason?: string }> = {};

  for (const [provider, keyName] of Object.entries(PROVIDER_KEYS)) {
    if (keyName === null) {
      // Gemini uses OAuth
      const result = Bun.spawnSync(["which", "gemini"]);
      const available = result.exitCode === 0;
      status[provider] = {
        available,
        reason: available ? "OAuth configured" : "gemini CLI not found",
      };
    } else {
      const key = process.env[keyName] || envVars[keyName];
      status[provider] = {
        available: !!key,
        reason: key ? `${keyName} set` : `${keyName} missing`,
      };
    }
  }

  return status as Record<Provider, { available: boolean; reason?: string }>;
}
