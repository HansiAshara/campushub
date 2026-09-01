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

    @PostConstruct
    public void ensureBucketExistsAndIsPublic() {
        try {
            // Update bucket to public: true
            String bucketUrl = supabaseConfig.getUrl() + "/storage/v1/bucket/" + supabaseConfig.getBucket();
            restClient.put()
                    .uri(bucketUrl)
                    .header("apikey", supabaseConfig.getServiceKey())
                    .header("Authorization", "Bearer " + supabaseConfig.getServiceKey())
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
                        .header("apikey", supabaseConfig.getServiceKey())
                        .header("Authorization", "Bearer " + supabaseConfig.getServiceKey())
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
