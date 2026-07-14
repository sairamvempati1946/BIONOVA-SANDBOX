package com.bionova.controller;

import com.bionova.service.SupabaseStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Storage Controller — handles file uploads to Supabase Storage buckets.
 *
 * ── IMAGES bucket (public) ─────────────────────────────────────────────────
 *   POST /api/storage/upload/company-logo          → logos/company/
 *   POST /api/storage/upload/plant-logo            → logos/plantmaster/
 *   POST /api/storage/upload/land-logo             → logos/landmaster/
 *   POST /api/storage/upload/employee-photo        → photos/employees/
 *   POST /api/storage/upload/external-employee-photo → photos/external-employees/
 *   POST /api/storage/upload/project-logo          → projects/
 *
 * ── DOCUMENTS bucket ───────────────────────────────────────────────────────
 *   POST /api/storage/upload/attachment/milestone  → attachments/milestones/
 *   POST /api/storage/upload/attachment/task       → attachments/tasks/
 *   POST /api/storage/upload/attachment/project    → attachments/projects/
 *
 * ── COMMON ─────────────────────────────────────────────────────────────────
 *   DELETE /api/storage/delete                     → delete file by URL
 */
@RestController
@RequestMapping("/api/storage")
public class StorageController {

    @Autowired
    private SupabaseStorageService storageService;

    // ── IMAGES ──────────────────────────────────────────────────────────────

    /**
     * Upload a company logo.
     * Stored in: images/logos/company/<uuid>.<ext>
     * Returns: { "url": "https://..." }
     */
    @PostMapping("/upload/company-logo")
    public ResponseEntity<?> uploadCompanyLogo(@RequestParam("file") MultipartFile file) {
        return uploadImage(SupabaseStorageService.FOLDER_COMPANY_LOGOS, file);
    }

    /**
     * Upload a plant master logo/image.
     * Stored in: images/logos/plantmaster/<uuid>.<ext>
     */
    @PostMapping("/upload/plant-logo")
    public ResponseEntity<?> uploadPlantLogo(@RequestParam("file") MultipartFile file) {
        return uploadImage(SupabaseStorageService.FOLDER_PLANT_LOGOS, file);
    }

    /**
     * Upload a land master logo/image.
     * Stored in: images/logos/landmaster/<uuid>.<ext>
     */
    @PostMapping("/upload/land-logo")
    public ResponseEntity<?> uploadLandLogo(@RequestParam("file") MultipartFile file) {
        return uploadImage(SupabaseStorageService.FOLDER_LAND_LOGOS, file);
    }

    /**
     * Upload an employee profile photo.
     * Stored in: images/photos/employees/<uuid>.<ext>
     */
    @PostMapping("/upload/employee-photo")
    public ResponseEntity<?> uploadEmployeePhoto(@RequestParam("file") MultipartFile file) {
        return uploadImage(SupabaseStorageService.FOLDER_EMPLOYEE_PHOTOS, file);
    }

    /**
     * Upload an external employee profile photo.
     * Stored in: images/photos/external-employees/<uuid>.<ext>
     */
    @PostMapping("/upload/external-employee-photo")
    public ResponseEntity<?> uploadExternalEmployeePhoto(@RequestParam("file") MultipartFile file) {
        return uploadImage(SupabaseStorageService.FOLDER_EXT_EMPLOYEE_PHOTOS, file);
    }

    /**
     * Upload a project logo.
     * Stored in: images/projects/<uuid>.<ext>
     */
    @PostMapping("/upload/project-logo")
    public ResponseEntity<?> uploadProjectLogo(@RequestParam("file") MultipartFile file) {
        return uploadImage(SupabaseStorageService.FOLDER_PROJECT_LOGOS, file);
    }

    // ── DOCUMENTS ───────────────────────────────────────────────────────────

    /**
     * Upload a milestone attachment document.
     * Stored in: documents/attachments/milestones/<uuid>.<ext>
     */
    @PostMapping("/upload/attachment/milestone")
    public ResponseEntity<?> uploadMilestoneAttachment(@RequestParam("file") MultipartFile file) {
        return uploadDocument(SupabaseStorageService.FOLDER_ATTACHMENT_MILESTONES, file);
    }

    /**
     * Upload a task attachment document (draft or live).
     * Stored in: documents/attachments/tasks/<uuid>.<ext>
     */
    @PostMapping("/upload/attachment/task")
    public ResponseEntity<?> uploadTaskAttachment(@RequestParam("file") MultipartFile file) {
        return uploadDocument(SupabaseStorageService.FOLDER_ATTACHMENT_TASKS, file);
    }

    /**
     * Upload a project attachment document.
     * Stored in: documents/attachments/projects/<uuid>.<ext>
     */
    @PostMapping("/upload/attachment/project")
    public ResponseEntity<?> uploadProjectAttachment(@RequestParam("file") MultipartFile file) {
        return uploadDocument(SupabaseStorageService.FOLDER_ATTACHMENT_PROJECTS, file);
    }

    // ── DELETE ───────────────────────────────────────────────────────────────

    /**
     * Delete a file by its public URL.
     * Body: { "url": "https://daaoeapbouspxcuprsqx.supabase.co/storage/v1/object/public/..." }
     */
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteFile(@RequestBody Map<String, String> body) {
        String url = body.get("url");
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File URL is required."));
        }
        storageService.deleteFileByUrl(url);
        return ResponseEntity.ok(Map.of("message", "File deleted successfully."));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private ResponseEntity<?> uploadImage(String folder, MultipartFile file) {
        return upload(SupabaseStorageService.BUCKET_IMAGES, folder, file);
    }

    private ResponseEntity<?> uploadDocument(String folder, MultipartFile file) {
        return upload(SupabaseStorageService.BUCKET_DOCUMENTS, folder, file);
    }

    private ResponseEntity<?> upload(String bucket, String folder, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is required and must not be empty."));
        }
        try {
            String url = storageService.uploadFile(bucket, folder, file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }
}
