package com.campushub.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;

@Configuration
@Getter
public class SupabaseConfig {

    @Value("${supabase.url}")
    private String url;

    @Value("${supabase.storage.bucket}")
    private String bucket;

    @Value("${supabase.service.key}")
    private String serviceKey;
}