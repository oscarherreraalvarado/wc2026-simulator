import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Profile, UserSession } from '@wc2026/shared-types';
import { SupabaseService } from '../supabase/supabase.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

interface ProfileRow {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /** Registra un usuario en Supabase Auth (trigger crea el perfil). */
  async register(dto: RegisterDto): Promise<UserSession> {
    const authClient = this.supabaseService.getAuthClient();
    const { data, error } = await authClient.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: { data: { username: dto.username } },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }
    if (!data.session || !data.user) {
      throw new BadRequestException('Registro incompleto. Verifica confirmación de email.');
    }

    const profile = await this.findProfile(data.user.id);

    return {
      userId: data.user.id,
      email: data.user.email ?? dto.email,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      profile,
    };
  }

  /** Inicia sesión con email y contraseña. */
  async login(dto: LoginDto): Promise<UserSession> {
    const authClient = this.supabaseService.getAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException(error?.message ?? 'Credenciales inválidas');
    }

    const profile = await this.findProfile(data.user.id);

    return {
      userId: data.user.id,
      email: data.user.email ?? dto.email,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      profile,
    };
  }

  /** Cierra sesión global del usuario (service role). */
  async logout(userId: string): Promise<void> {
    const { error } = await this.supabaseService.getClient().auth.admin.signOut(userId, 'global');
    if (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async findProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('id, username, avatar_url, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const row = data as ProfileRow;
    return {
      id: row.id,
      username: row.username,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
    };
  }
}
