/** Perfil de usuario extendido desde Supabase Auth. */
export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
}

/** Sesión autenticada del usuario. */
export interface UserSession {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  profile: Profile | null;
}

/** Payload JWT decodificado de Supabase. */
export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  exp: number;
  iat: number;
}
