package com.contractrisk.service;

import com.contractrisk.dto.ContractDtos;
import com.contractrisk.dto.RiskLevel;
import com.contractrisk.exception.ContractProcessingException;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

/**
 * Service for stateless in-memory PDF audit report generation using iText7.
 * Renders structured risk analysis, clause breakdowns, and privacy disclosures.
 */
@Service
@Slf4j
public class ReportService {

    private static final DeviceRgb BRAND_PRIMARY = new DeviceRgb(37, 99, 235);    // #2563EB
    private static final DeviceRgb DARK_HEADER = new DeviceRgb(15, 23, 42);      // #0F172A
    private static final DeviceRgb LIGHT_BG = new DeviceRgb(248, 250, 252);      // #F8FAFC
    private static final DeviceRgb BORDER_COLOR = new DeviceRgb(226, 232, 240);  // #E2E8F0
    private static final DeviceRgb MUTED_TEXT = new DeviceRgb(100, 116, 139);    // #64748B

    private static final DeviceRgb HIGH_COLOR = new DeviceRgb(220, 38, 38);      // #DC2626
    private static final DeviceRgb MEDIUM_COLOR = new DeviceRgb(217, 119, 6);    // #D97706
    private static final DeviceRgb LOW_COLOR = new DeviceRgb(22, 163, 74);       // #16A34A

    public byte[] exportReportAsPdf(ContractDtos.RiskReportDto report) {
        if (report == null) {
            throw new IllegalArgumentException("Report data cannot be null for PDF generation.");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            document.setMargins(36, 36, 36, 36);

            PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont fontRegular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont fontOblique = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            Border cellBorder = new SolidBorder(BORDER_COLOR, 1f);

            // 1. Header Banner
            document.add(new Paragraph("CONTRACTIQ")
                    .setFont(fontBold)
                    .setFontSize(22)
                    .setFontColor(BRAND_PRIMARY)
                    .setMarginBottom(2));

            document.add(new Paragraph("AI-Powered Contract Risk Audit Report")
                    .setFont(fontBold)
                    .setFontSize(14)
                    .setFontColor(DARK_HEADER)
                    .setMarginBottom(4));

            String formattedDate = report.getAnalyzedAt() != null
                    ? report.getAnalyzedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm:ss"))
                    : "N/A";

            document.add(new Paragraph("Target File: " + report.getOriginalFilename() + "  |  Audit Timestamp: " + formattedDate)
                    .setFont(fontRegular)
                    .setFontSize(9)
                    .setFontColor(MUTED_TEXT)
                    .setMarginBottom(16));

            // 2. Risk Scorecard Box
            Table scorecardTable = new Table(UnitValue.createPercentArray(new float[]{1.5f, 1, 1, 1}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(16);

            DeviceRgb scoreColor = getScoreColor(report.getOverallScore());

            Cell scoreCell = new Cell()
                    .add(new Paragraph("OVERALL RISK SCORE")
                            .setFont(fontBold).setFontSize(9).setFontColor(MUTED_TEXT))
                    .add(new Paragraph(String.valueOf(report.getOverallScore()) + "/100")
                            .setFont(fontBold).setFontSize(26).setFontColor(scoreColor))
                    .add(new Paragraph(formatRiskCategory(report.getRiskCategory()))
                            .setFont(fontBold).setFontSize(10).setFontColor(scoreColor))
                    .setBackgroundColor(LIGHT_BG)
                    .setPadding(12)
                    .setBorder(cellBorder);
            scorecardTable.addCell(scoreCell);

            scorecardTable.addCell(createMetricCell("High Risk Clauses", String.valueOf(report.getHighRiskCount()), HIGH_COLOR, fontBold, fontRegular, cellBorder));
            scorecardTable.addCell(createMetricCell("Medium Risk Clauses", String.valueOf(report.getMediumRiskCount()), MEDIUM_COLOR, fontBold, fontRegular, cellBorder));
            scorecardTable.addCell(createMetricCell("Low Risk Clauses", String.valueOf(report.getLowRiskCount()), LOW_COLOR, fontBold, fontRegular, cellBorder));

            document.add(scorecardTable);

            // 3. Executive Contract Summary
            if (report.getContractSummary() != null && !report.getContractSummary().isBlank()) {
                document.add(new Paragraph("Executive Summary")
                        .setFont(fontBold)
                        .setFontSize(12)
                        .setFontColor(DARK_HEADER)
                        .setMarginBottom(4));

                Table summaryBox = new Table(UnitValue.createPercentArray(new float[]{1}))
                        .setWidth(UnitValue.createPercentValue(100))
                        .setMarginBottom(16);

                summaryBox.addCell(new Cell()
                        .add(new Paragraph(report.getContractSummary())
                                .setFont(fontRegular)
                                .setFontSize(9.5f)
                                .setFontColor(DARK_HEADER)
                                .setMultipliedLeading(1.3f))
                        .setBackgroundColor(LIGHT_BG)
                        .setPadding(10)
                        .setBorder(cellBorder));

                document.add(summaryBox);
            }

            // 4. Detailed Clause Analysis
            document.add(new Paragraph("Clause-by-Clause Legal Risk Assessment")
                    .setFont(fontBold)
                    .setFontSize(12)
                    .setFontColor(DARK_HEADER)
                    .setMarginBottom(6));

            if (report.getClauses() != null && !report.getClauses().isEmpty()) {
                Table clauseTable = new Table(UnitValue.createPercentArray(new float[]{2.2f, 1.4f, 1.0f, 4.4f}))
                        .setWidth(UnitValue.createPercentValue(100))
                        .setMarginBottom(20);

                clauseTable.addHeaderCell(createTableHeaderCell("Clause Type", fontBold));
                clauseTable.addHeaderCell(createTableHeaderCell("Risk Level", fontBold));
                clauseTable.addHeaderCell(createTableHeaderCell("Score", fontBold));
                clauseTable.addHeaderCell(createTableHeaderCell("Risk Findings & Suggestions", fontBold));

                for (ContractDtos.ClauseAnalysisDto clause : report.getClauses()) {
                    DeviceRgb riskColor = getRiskLevelColor(clause.getRiskLevel());

                    // Type
                    clauseTable.addCell(new Cell()
                            .add(new Paragraph(clause.getClauseType() != null ? clause.getClauseType() : "General")
                                    .setFont(fontBold).setFontSize(9).setFontColor(DARK_HEADER))
                            .setPadding(6)
                            .setBorder(cellBorder));

                    // Level
                    clauseTable.addCell(new Cell()
                            .add(new Paragraph(clause.getRiskLevel() != null ? clause.getRiskLevel().name() : "LOW")
                                    .setFont(fontBold).setFontSize(9).setFontColor(riskColor))
                            .setPadding(6)
                            .setBorder(cellBorder));

                    // Score
                    clauseTable.addCell(new Cell()
                            .add(new Paragraph(clause.getRiskScore() != null ? clause.getRiskScore().toString() : "0")
                                    .setFont(fontRegular).setFontSize(9).setTextAlignment(TextAlignment.CENTER))
                            .setPadding(6)
                            .setBorder(cellBorder));

                    // Findings & suggestions
                    Cell detailsCell = new Cell().setPadding(6).setBorder(cellBorder);
                    if (clause.getExplanation() != null && !clause.getExplanation().isBlank()) {
                        detailsCell.add(new Paragraph("Risk: " + clause.getExplanation())
                                .setFont(fontRegular).setFontSize(8.5f).setFontColor(DARK_HEADER).setMarginBottom(2));
                    }
                    if (clause.getMissingProtections() != null && !clause.getMissingProtections().isBlank()) {
                        detailsCell.add(new Paragraph("Missing Safeguards: " + clause.getMissingProtections())
                                .setFont(fontOblique).setFontSize(8f).setFontColor(HIGH_COLOR).setMarginBottom(2));
                    }
                    if (clause.getSuggestedRevision() != null && !clause.getSuggestedRevision().isBlank()) {
                        detailsCell.add(new Paragraph("Recommendation: " + clause.getSuggestedRevision())
                                .setFont(fontRegular).setFontSize(8f).setFontColor(BRAND_PRIMARY));
                    }
                    clauseTable.addCell(detailsCell);
                }

                document.add(clauseTable);
            }

            // 5. Privacy & Legal Disclaimers
            Table footerNotice = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginTop(10);

            Cell noticeCell = new Cell()
                    .add(new Paragraph("PRIVACY ARCHITECTURE & LEGAL NOTICE")
                            .setFont(fontBold).setFontSize(7.5f).setFontColor(MUTED_TEXT).setMarginBottom(2))
                    .add(new Paragraph("1. Privacy-First Stateless Processing: ContractIQ operates with zero permanent data persistence. No documents, clauses, or reports are stored on server disks or databases.\n"
                            + "2. External AI Processing Disclosure: Contract text was transmitted temporarily to Google Gemini API for risk analysis under applicable terms. Processing was temporary and ephemeral.\n"
                            + "3. Non-Legal Advice Disclaimer: This report is generated by an automated AI tool for initial contract review and risk triage. It does NOT constitute formal legal advice, attorney consultation, or legal representation.")
                            .setFont(fontRegular).setFontSize(7f).setFontColor(MUTED_TEXT).setMultipliedLeading(1.2f))
                    .setBackgroundColor(LIGHT_BG)
                    .setPadding(8)
                    .setBorder(cellBorder);

            footerNotice.addCell(noticeCell);
            document.add(footerNotice);

            document.close();
            log.info("Successfully generated in-memory PDF audit report for '{}' ({} bytes)",
                    report.getOriginalFilename(), baos.size());
            return baos.toByteArray();

        } catch (IOException e) {
            throw new ContractProcessingException("Failed to generate in-memory PDF analysis report.", e);
        }
    }

    private Cell createMetricCell(String label, String value, DeviceRgb color, PdfFont fontBold, PdfFont fontRegular, Border border) {
        return new Cell()
                .add(new Paragraph(label).setFont(fontRegular).setFontSize(8.5f).setFontColor(MUTED_TEXT))
                .add(new Paragraph(value).setFont(fontBold).setFontSize(18).setFontColor(color))
                .setBackgroundColor(LIGHT_BG)
                .setPadding(10)
                .setBorder(border);
    }

    private Cell createTableHeaderCell(String title, PdfFont font) {
        return new Cell()
                .add(new Paragraph(title).setFont(font).setFontSize(9).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(DARK_HEADER)
                .setPadding(6);
    }

    private DeviceRgb getScoreColor(Integer score) {
        if (score == null) return DARK_HEADER;
        if (score >= 70) return HIGH_COLOR;
        if (score >= 40) return MEDIUM_COLOR;
        return LOW_COLOR;
    }

    private DeviceRgb getRiskLevelColor(RiskLevel level) {
        if (level == null) return LOW_COLOR;
        return switch (level) {
            case HIGH -> HIGH_COLOR;
            case MEDIUM -> MEDIUM_COLOR;
            case LOW -> LOW_COLOR;
        };
    }

    private String formatRiskCategory(String category) {
        if ("HIGH_RISK".equalsIgnoreCase(category)) return "HIGH RISK";
        if ("MODERATE_RISK".equalsIgnoreCase(category)) return "MODERATE RISK";
        return "LOW RISK";
    }
}
