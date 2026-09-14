package com.campushub.backend.service;

import com.campushub.backend.config.SupabaseConfig;
import jakarta.annotation.PostConstruct;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private final SupabaseConfig supabaseConfig;
    private final RestClient restClient;

    public FileStorageService(SupabaseConfig supabaseConfig) {
        this.supabaseConfig = supabaseConfig;
        this.restClient = RestClient.create();
    }

    private final String VALID_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaXV2d3FrZGVjanZ0d3Rtc250Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzMzMzUxNiwiZXhwIjoyMTAyOTA5NTE2fQ.rV3q3mTCZQnf7cokbzYY6DsI-hZ1__j97ooomiHGpJ8";

    @PostConstruct
    public void ensureBucketExistsAndIsPublic() {
        try {
            // Update bucket to public: true
            String bucketUrl = supabaseConfig.getUrl() + "/storage/v1/bucket/" + supabaseConfig.getBucket();
            restClient.put()
                    .uri(bucketUrl)
                    .header("apikey", VALID_KEY)
                    .header("Authorization", "Bearer " + VALID_KEY)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("public", true))
                    .retrieve()
                    .toBodilessEntity();
            System.out.println("Supabase storage bucket '" + supabaseConfig.getBucket() + "' verified as public.");
        } catch (Exception e) {
            try {
                // If bucket does not exist, create it with public: true
                String createBucketUrl = supabaseConfig.getUrl() + "/storage/v1/bucket";
                restClient.post()
                        .uri(createBucketUrl)
                        .header("apikey", VALID_KEY)
                        .header("Authorization", "Bearer " + VALID_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("id", supabaseConfig.getBucket(), "name", supabaseConfig.getBucket(), "public", true))
                        .retrieve()
                        .toBodilessEntity();
                System.out.println("Supabase storage bucket '" + supabaseConfig.getBucket() + "' created as public.");
            } catch (Exception ex) {
                System.err.println("Warning: Could not initialize Supabase storage bucket: " + ex.getMessage());
            }
        }
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
        // Ensure bucket is public before upload
        ensureBucketExistsAndIsPublic();

        String originalName = file.getOriginalFilename();
        if (originalName != null) {
            originalName = originalName.replaceAll("[^a-zA-Z0-9.-]", "_");
        }
        String fileName = UUID.randomUUID() + "-" + originalName;
        
        String uploadUrl = supabaseConfig.getUrl() + "/storage/v1/object/"
                + supabaseConfig.getBucket() + "/" + fileName;

        try {
            restClient.put()
                    .uri(uploadUrl)
                    .header("apikey", VALID_KEY)
                    .header("Authorization", "Bearer " + VALID_KEY)
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
