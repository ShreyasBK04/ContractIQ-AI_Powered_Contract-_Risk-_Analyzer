package com.contractrisk;

import com.contractrisk.dto.ContractDtos;
import com.contractrisk.dto.RiskLevel;
import com.contractrisk.service.ContractService;
import com.contractrisk.service.PdfExtractionService;
import com.contractrisk.service.ReportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "ai.api.key=test-key",
        "ai.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent"
})
class ContractRiskApplicationTests {

    @Autowired
    private ContractService contractService;

    @Autowired
    private ReportService reportService;

    @Test
    @DisplayName("Application context loads successfully without database or security")
    void contextLoads() {
        assertNotNull(contractService);
        assertNotNull(reportService);
    }

    @Test
    @DisplayName("Stateless PDF report generation produces valid bytes")
    void testPdfExportGeneration() {
        ContractDtos.ClauseAnalysisDto clause = ContractDtos.ClauseAnalysisDto.builder()
                .id(UUID.randomUUID().toString())
                .clauseIndex(0)
                .clauseType("Indemnification")
                .riskLevel(RiskLevel.HIGH)
                .riskScore(85)
                .clauseText("Vendor shall indemnify Client against all claims without limitation.")
                .explanation("Uncapped unilateral indemnification creates significant financial exposure.")
                .missingProtections("Mutual indemnity, aggregate liability cap, notice of claim requirements.")
                .suggestedRevision("Vendor liability shall be subject to standard commercial mutual indemnification capped at fees paid.")
                .build();

        ContractDtos.RiskReportDto report = ContractDtos.RiskReportDto.builder()
                .contractId(UUID.randomUUID())
                .originalFilename("Master_Services_Agreement.pdf")
                .fileSizeBytes(128000L)
                .overallScore(85)
                .riskCategory("HIGH_RISK")
                .contractSummary("Standard B2B SaaS agreement with unilateral vendor obligations and uncapped indemnities.")
                .totalClauses(1)
                .highRiskCount(1)
                .mediumRiskCount(0)
                .lowRiskCount(0)
                .analyzedAt(LocalDateTime.now())
                .clauses(List.of(clause))
                .build();

        byte[] pdfBytes = reportService.exportReportAsPdf(report);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 500, "Generated PDF should contain readable bytes");
        // Verify %PDF signature
        assertEquals(0x25, pdfBytes[0]); // %
        assertEquals(0x50, pdfBytes[1]); // P
        assertEquals(0x44, pdfBytes[2]); // D
        assertEquals(0x46, pdfBytes[3]); // F
    }

    @Test
    @DisplayName("Reject upload without server-side user consent")
    void testConsentRequired() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                "%PDF-1.4 test".getBytes()
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            contractService.analyzeContract(file, false);
        });

        assertTrue(ex.getMessage().contains("User consent"));
    }

    @Test
    @DisplayName("Reject invalid file missing PDF magic bytes")
    void testPdfMagicBytesValidation_InvalidFile() {
        MockMultipartFile invalidFile = new MockMultipartFile(
                "file",
                "not_a_pdf.pdf",
                "application/pdf",
                "This is plain text pretending to be a PDF".getBytes()
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            contractService.analyzeContract(invalidFile, true);
        });

        assertTrue(ex.getMessage().contains("missing %PDF signature"));
    }
}
