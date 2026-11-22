package com.contractrisk.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ContractDtos {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ClauseAnalysisDto {
        private String id;
        private Integer clauseIndex;
        private String clauseType;
        private RiskLevel riskLevel;
        private Integer riskScore;
        private String clauseText;
        private String explanation;
        private String missingProtections;
        private String suggestedRevision;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RiskReportDto {
        private UUID contractId;

        @NotBlank(message = "Filename must not be blank")
        private String originalFilename;

        private Long fileSizeBytes;

        @NotNull(message = "Overall score must be present")
        private Integer overallScore;

        private String riskCategory;
        private String contractSummary;

        private Integer totalClauses;
        private Integer highRiskCount;
        private Integer mediumRiskCount;
        private Integer lowRiskCount;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime analyzedAt;

        private List<ClauseAnalysisDto> clauses;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ErrorResponse {
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime timestamp;
        private int status;
        private String error;
        private String message;
    }
}
