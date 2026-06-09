import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase.config';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>(supabaseConfig.urlKey);
    const serviceRoleKey = this.configService.getOrThrow<string>(
      supabaseConfig.serviceRoleKeyKey,
    );
    this.client = createClient(url, serviceRoleKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
