import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase.config';
import { createSupabaseClient } from './create-supabase-client';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;
  private readonly authClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>(supabaseConfig.urlKey);
    const serviceRoleKey = this.configService.getOrThrow<string>(
      supabaseConfig.serviceRoleKeyKey,
    );
    const anonKey = this.configService.getOrThrow<string>(supabaseConfig.anonKeyKey);

    this.client = createSupabaseClient(url, serviceRoleKey);
    this.authClient = createSupabaseClient(url, anonKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  /** Cliente con anon key — solo operaciones Auth públicas (login/registro). */
  getAuthClient(): SupabaseClient {
    return this.authClient;
  }
}
