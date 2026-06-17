export function hasClerkConfig() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

export function hasNvidiaConfig() {
  return Boolean(process.env.NVIDIA_API_KEY);
}

/** @deprecated Use hasNvidiaConfig() — Anthropic has been replaced by NVIDIA NIM */
export function hasAnthropicConfig() {
  return false;
}

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
