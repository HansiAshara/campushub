package com.campushub.backend.service;

import com.campushub.backend.config.SupabaseConfig;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class FileStorageService {

    private final SupabaseConfig supabaseConfig;
    private final RestClient restClient;

    public FileStorageService(SupabaseConfig supabaseConfig) {
        this.supabaseConfig = supabaseConfig;
        this.restClient = RestClient.create();
    }

    public String computeFileHash(MultipartFile file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(file.getBytes());
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException | IOException e) {
            throw new RuntimeException("Failed to compute file hash", e);
        }
    }

    public String uploadFile(MultipartFile file) {
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        String uploadUrl = supabaseConfig.getUrl() + "/storage/v1/object/"
                + supabaseConfig.getBucket() + "/" + fileName;

        try {
            restClient.put()
                    .uri(uploadUrl)
                    .header("apikey", supabaseConfig.getServiceKey())
                    .header("Authorization", "Bearer " + supabaseConfig.getServiceKey())
                    .header("Content-Type", file.getContentType())
                    .body(file.getBytes())
                    .retrieve()
                    .toBodilessEntity();

            return supabaseConfig.getUrl() + "/storage/v1/object/public/"
                    + supabaseConfig.getBucket() + "/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to read file bytes", e);
        }
    }
}
