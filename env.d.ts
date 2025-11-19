/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_CLERK_FRONTEND_API: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    // Optional:
    CLERK_SECRET_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    // Brex API:
    BREX_API_KEY: string;
    BREX_API_URL?: string;
  }
}
