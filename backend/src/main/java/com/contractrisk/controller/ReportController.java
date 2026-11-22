package com.contractrisk.controller;

import com.contractrisk.dto.ContractDtos;
import com.contractrisk.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller providing in-memory export of contract risk reports.
 * Stateless: converts submitted report data directly into a downloadable PDF document.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    /**
     * Generates and streams a PDF audit report based on the active in-memory analysis report.
     */
    @PostMapping("/export")
    public ResponseEntity<byte[]> exportReport(
            @Valid @RequestBody ContractDtos.RiskReportDto reportDto) {
        log.info("Generating downloadable PDF report for file: {}", reportDto.getOriginalFilename());
        byte[] pdfBytes = reportService.exportReportAsPdf(reportDto);

        String safeFilename = reportDto.getOriginalFilename() != null
                ? reportDto.getOriginalFilename().replace(".pdf", "") + "-Risk-Audit.pdf"
                : "ContractIQ-Risk-Audit.pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", safeFilename);
        headers.setContentLength(pdfBytes.length);
        headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.set("Pragma", "no-cache");
        headers.set("Expires", "0");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
