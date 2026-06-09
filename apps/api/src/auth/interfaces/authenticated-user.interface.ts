/** Usuario autenticado adjunto al request por JwtStrategy. */
export interface AuthenticatedUser {
  userId: string;
  email?: string;
}
