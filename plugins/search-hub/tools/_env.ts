/**
 * _env.ts - Environment loader and key validation for search-hub
 *
 * Resolution order: process.env → ~/.search-hub/.env
 */

import { readFileSync, existsSync, mkdirSync, copyFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { Provider } from "./_types";

const PROVIDER_KEYS: Record<Provider, string> = {
  tavily: "TAVILY_API_KEY",
  perplexity: "PERPLEXITY_API_KEY",
  gemini: "GEMINI_API_KEY",
  exa: "EXA_API_KEY",
};

const SIGNUP_URLS: Record<Provider, string> = {
  tavily: "https://app.tavily.com/",
  perplexity: "https://www.perplexity.ai/settings/api",
  gemini: "https://aistudio.google.com/apikey",
  exa: "https://dashboard.exa.ai/",
};

export const CONFIG_DIR = join(homedir(), ".search-hub");
export const ENV_PATH = join(CONFIG_DIR, ".env");
const ENV_EXAMPLE = join(import.meta.dir, "..", ".env.example");

/** Actionable error text for a missing provider key. */
export function missingKeyMessage(provider: Provider): string {
  return `${PROVIDER_KEYS[provider]} not set. Get a key at ${SIGNUP_URLS[provider]} and add it to ${ENV_PATH}`;
}

/**
 * First-run bootstrap: create ~/.search-hub/ and seed .env from .env.example
 * if no .env exists. Returns true if a new .env was written.
 */
export function setupEnv(): boolean {
  mkdirSync(CONFIG_DIR, { recursive: true });
  if (existsSync(ENV_PATH)) return false;
  copyFileSync(ENV_EXAMPLE, ENV_PATH);
  return true;
}

// Cache resolved keys so we only read the .env file once
const keyCache: Record<string, string | undefined> = {};
let dotenvLoaded = false;
const dotenvValues: Record<string, string> = {};

function loadDotenv(): void {
  if (dotenvLoaded) return;
  dotenvLoaded = true;
  try {
    const content = readFileSync(ENV_PATH, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (key && val) dotenvValues[key] = val;
    }
  } catch {
    // .env file not found or unreadable
  }
}

function resolveKey(envVar: string): string | undefined {
  if (envVar in keyCache) return keyCache[envVar];

  // Try process.env first
  let value = process.env[envVar];

  // Fall back to ~/.search-hub/.env
  if (!value) {
    loadDotenv();
    value = dotenvValues[envVar];
    if (value) process.env[envVar] = value;
  }

  keyCache[envVar] = value || undefined;
  return keyCache[envVar];
}

export function getKey(provider: Provider): string | undefined {
  return resolveKey(PROVIDER_KEYS[provider]);
}

export function isProviderAvailable(provider: Provider): boolean {
  return !!getKey(provider);
}

export function getAvailableProviders(): Provider[] {
  const providers: Provider[] = ["tavily", "perplexity", "gemini", "exa"];
  return providers.filter(isProviderAvailable);
}

export function getProviderStatus(): Record<
  Provider,
  { available: boolean; reason?: string }
> {
  const status: Record<string, { available: boolean; reason?: string }> = {};

  for (const [provider, keyName] of Object.entries(PROVIDER_KEYS)) {
    const key = resolveKey(keyName);
    status[provider] = {
      available: !!key,
      reason: key
        ? `${keyName} set`
        : `${keyName} missing (${SIGNUP_URLS[provider as Provider]})`,
    };
  }

  return status as Record<Provider, { available: boolean; reason?: string }>;
}
