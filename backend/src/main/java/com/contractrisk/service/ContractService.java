package com.contractrisk.service;

import com.contractrisk.dto.ContractDtos;
import com.contractrisk.dto.RiskLevel;
import com.contractrisk.exception.ContractProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Core business service for contract risk analysis.
 * Operates statelessly in-memory without persistent database storage.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContractService {

    private final PdfExtractionService pdfExtractionService;
    private final AiAnalysisService aiAnalysisService;

    private static final long MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

    public ContractDtos.RiskReportDto analyzeContract(MultipartFile file, boolean consent) {
        if (!consent) {
            throw new IllegalArgumentException("User consent acknowledging external AI processing is required before analysis.");
        }

        validateFile(file);

        String originalFilename = sanitizeFilename(file.getOriginalFilename());
        long fileSizeBytes = file.getSize();

        // 1. Text extraction & clause segmentation in memory
        List<String> clauses = pdfExtractionService.extractClauses(file);
        if (clauses == null || clauses.isEmpty()) {
            throw new ContractProcessingException("No analyzable contractual clauses could be identified in the document.");
        }

        // 2. Gemini AI risk evaluation
        AiAnalysisService.AiAnalysisResult analysisResult = aiAnalysisService.analyzeContract(clauses, originalFilename);
        List<ContractDtos.ClauseAnalysisDto> analyzedClauses = analysisResult.getClauseAnalyses();

        // 3. Compute aggregate statistics
        long highCount = analyzedClauses.stream().filter(c -> c.getRiskLevel() == RiskLevel.HIGH).count();
        long mediumCount = analyzedClauses.stream().filter(c -> c.getRiskLevel() == RiskLevel.MEDIUM).count();
        long lowCount = analyzedClauses.stream().filter(c -> c.getRiskLevel() == RiskLevel.LOW).count();

        int overallScore = calculateOverallScore(analyzedClauses, highCount, mediumCount, lowCount);
        String riskCategory = classifyRiskCategory(overallScore);

        UUID reportId = UUID.randomUUID();
        log.info("Analysis completed for reportId: {}. Score: {}, Clauses: {}", reportId, overallScore, analyzedClauses.size());

        return ContractDtos.RiskReportDto.builder()
                .contractId(reportId)
                .originalFilename(originalFilename)
                .fileSizeBytes(fileSizeBytes)
                .overallScore(overallScore)
                .riskCategory(riskCategory)
                .contractSummary(analysisResult.getContractSummary())
                .totalClauses(analyzedClauses.size())
                .highRiskCount((int) highCount)
                .mediumRiskCount((int) mediumCount)
                .lowRiskCount((int) lowCount)
                .analyzedAt(LocalDateTime.now())
                .clauses(analyzedClauses)
                .build();
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a PDF contract to analyze.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File size exceeds the 20MB limit.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF document files (.pdf) are supported.");
        }

        // Verify PDF Magic Bytes (%PDF signature)
        validatePdfMagicBytes(file);
    }

    private void validatePdfMagicBytes(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[4];
            int bytesRead = is.read(header);
            if (bytesRead < 4 || header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46) { // %PDF
                throw new IllegalArgumentException("The uploaded file is not a valid PDF document (missing %PDF signature).");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to read uploaded file to verify format: " + e.getMessage(), e);
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "contract_document.pdf";
        }
        return filename.replaceAll("[^a-zA-Z0-9._\\-\\s()]", "_");
    }

    private int calculateOverallScore(List<ContractDtos.ClauseAnalysisDto> clauses, long highCount, long mediumCount, long lowCount) {
        if (clauses.isEmpty()) {
            return 0;
        }

        double rawAvg = clauses.stream()
                .mapToInt(c -> c.getRiskScore() != null ? c.getRiskScore() : 30)
                .average()
                .orElse(30);

        double highRatio = (double) highCount / clauses.size();
        if (highRatio > 0.3) {
            rawAvg = Math.max(rawAvg, 75.0);
        } else if (highCount > 0 && rawAvg < 50) {
            rawAvg = Math.min(100.0, rawAvg + (highCount * 5));
        }

        return (int) Math.round(Math.min(100, Math.max(0, rawAvg)));
    }

    private String classifyRiskCategory(int overallScore) {
        if (overallScore >= 70) {
            return "HIGH_RISK";
        } else if (overallScore >= 40) {
            return "MODERATE_RISK";
        } else {
            return "LOW_RISK";
        }
    }
}
