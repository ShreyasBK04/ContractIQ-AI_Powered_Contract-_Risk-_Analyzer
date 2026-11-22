package com.contractrisk.controller;

import com.contractrisk.dto.ContractDtos;
import com.contractrisk.service.ContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Controller handling stateless contract upload and risk analysis.
 * Operates without authentication, sessions, or persistent document storage.
 */
@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@Slf4j
public class ContractController {

    private final ContractService contractService;

    /**
     * Health check verifying API availability and stateless mode.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "ContractIQ API",
                "persistence", "None (Stateless In-Memory / Ephemeral Processing)",
                "aiProvider", "Google Gemini"
        ));
    }

    /**
     * Uploads and analyzes a PDF contract.
     * Enforces explicit user consent acknowledging external AI processing before analysis starts.
     */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContractDtos.RiskReportDto> analyzeContract(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "consent", defaultValue = "false") boolean consent) {
        if (!consent) {
            throw new IllegalArgumentException("User consent acknowledging external AI processing is required before analysis.");
        }

        String safeName = sanitizeLogName(file != null ? file.getOriginalFilename() : "null");
        long size = file != null ? file.getSize() : 0;
        log.info("Received contract analysis request for: '{}' ({} bytes, consent=verified)", safeName, size);

        ContractDtos.RiskReportDto report = contractService.analyzeContract(file, consent);
        return ResponseEntity.ok(report);
    }

    /**
     * Backward-compatible alias for /analyze.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContractDtos.RiskReportDto> uploadContract(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "consent", defaultValue = "false") boolean consent) {
        return analyzeContract(file, consent);
    }

    private String sanitizeLogName(String raw) {
        if (raw == null) return "unknown.pdf";
        return raw.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
