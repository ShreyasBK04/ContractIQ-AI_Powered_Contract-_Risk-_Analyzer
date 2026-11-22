package com.contractrisk.service;

import com.contractrisk.dto.ContractDtos;
import com.contractrisk.dto.RiskLevel;
import com.contractrisk.exception.ContractProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service orchestrating AI contract analysis via Google Gemini API.
 * Uses structured prompts, handles JSON responses, and executes retries.
 * Never logs confidential contract text or sensitive API credentials.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiAnalysisService {

    private final WebClient aiWebClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.api.url}")
    private String apiUrl;

    public static class AiAnalysisResult {
        private String contractSummary;
        private List<ContractDtos.ClauseAnalysisDto> clauseAnalyses;

        public AiAnalysisResult(String contractSummary, List<ContractDtos.ClauseAnalysisDto> clauseAnalyses) {
            this.contractSummary = contractSummary;
            this.clauseAnalyses = clauseAnalyses;
        }

        public String getContractSummary() {
            return contractSummary;
        }

        public List<ContractDtos.ClauseAnalysisDto> getClauseAnalyses() {
            return clauseAnalyses;
        }
    }

    public AiAnalysisResult analyzeContract(List<String> clauses, String filename) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new ContractProcessingException(
                    "Google Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable on the server."
            );
        }

        if (clauses == null || clauses.isEmpty()) {
            throw new IllegalArgumentException("No clauses supplied for analysis.");
        }

        StringBuilder numberedClauses = new StringBuilder();
        for (int i = 0; i < clauses.size(); i++) {
            numberedClauses.append("[").append(i).append("] ").append(clauses.get(i)).append("\n\n");
        }

        String prompt = """
                You are a senior commercial legal counsel and contract risk specialist.

                Analyze the following contract clauses from document: "%s".

                Evaluate the clauses thoroughly and return a single valid JSON object strictly matching this schema:
                {
                  "contract_summary": "Concise 2-4 sentence executive overview of what this agreement governs, key responsibilities, and main risk posture.",
                  "clauses": [
                    {
                      "clause_index": 0,
                      "clause_type": "Termination / Indemnification / Liability / Confidentiality / Payment / IP / Warranty / Dispute / Other",
                      "risk_level": "HIGH / MEDIUM / LOW",
                      "risk_score": 85,
                      "explanation": "Clear, objective explanation of why this clause presents legal or operational risk to the signing party.",
                      "missing_protections": "Key safeguards omitted (e.g., cure period, liability cap, mutual indemnity)",
                      "suggested_revision": "A balanced, protective counter-clause or negotiation recommendation."
                    }
                  ]
                }

                Requirements:
                - Return ONLY the raw JSON object.
                - Do not include markdown formatting or backticks.
                - Do not include conversational remarks outside the JSON.
                - Ensure every analyzed clause maps to its integer "clause_index" [0 to %d].
                - Assign risk_level as HIGH, MEDIUM, or LOW based on commercial contract standards.

                Contract Clauses:
                %s
                """.formatted(filename != null ? filename : "Document", clauses.size() - 1, numberedClauses.toString());

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "temperature", 0.1,
                        "maxOutputTokens", 8192
                )
        );

        String endpointUrl = apiUrl + (apiUrl.contains("?") ? "&key=" : "?key=") + apiKey;

        log.info("Dispatching contract analysis request to Gemini AI ({} clauses)...", clauses.size());
        String responseBody = callGeminiWithRetry(endpointUrl, requestBody);

        return parseGeminiResponse(responseBody, clauses);
    }

    private AiAnalysisResult parseGeminiResponse(String responseBody, List<String> originalClauses) {
        List<ContractDtos.ClauseAnalysisDto> clauseList = new ArrayList<>();
        String summary = "Automated contract risk evaluation completed.";

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isMissingNode() || !candidates.isArray() || candidates.isEmpty()) {
                throw new ContractProcessingException("Gemini AI returned an empty response. Please check API quota and model availability.");
            }

            JsonNode partsNode = candidates.get(0).path("content").path("parts");
            StringBuilder sb = new StringBuilder();
            if (partsNode.isArray()) {
                for (JsonNode part : partsNode) {
                    if (part.has("text")) {
                        sb.append(part.path("text").asText(""));
                    }
                }
            }
            String textContent = sb.toString();
            if (textContent.isBlank()) {
                throw new ContractProcessingException("Gemini AI returned empty content parts.");
            }

            String cleanJson = cleanJsonResponse(textContent);
            JsonNode parsedObj = objectMapper.readTree(cleanJson);

            if (parsedObj.has("contract_summary") && !parsedObj.get("contract_summary").asText().isBlank()) {
                summary = parsedObj.get("contract_summary").asText();
            }

            JsonNode clausesNode = parsedObj.has("clauses") ? parsedObj.get("clauses") : parsedObj;
            if (clausesNode.isArray()) {
                for (JsonNode node : clausesNode) {
                    String riskLevelString = node.path("risk_level").asText("LOW").trim().toUpperCase();
                    RiskLevel riskLevel;
                    try {
                        riskLevel = RiskLevel.valueOf(riskLevelString);
                    } catch (Exception e) {
                        riskLevel = RiskLevel.LOW;
                    }

                    int index = node.path("clause_index").asInt(-1);
                    String clauseText = (index >= 0 && index < originalClauses.size())
                            ? originalClauses.get(index)
                            : "";

                    int score = node.path("risk_score").asInt(20);
                    if (score <= 0 && riskLevel == RiskLevel.HIGH) score = 80;
                    else if (score <= 0 && riskLevel == RiskLevel.MEDIUM) score = 50;
                    else if (score <= 0) score = 20;

                    ContractDtos.ClauseAnalysisDto dto = ContractDtos.ClauseAnalysisDto.builder()
                            .id(UUID.randomUUID().toString())
                            .clauseIndex(index >= 0 ? index : clauseList.size())
                            .clauseType(node.path("clause_type").asText("General Terms"))
                            .riskLevel(riskLevel)
                            .riskScore(score)
                            .clauseText(clauseText.isBlank() && index >= 0 && index < originalClauses.size() ? originalClauses.get(index) : clauseText)
                            .explanation(node.path("explanation").asText("Standard commercial risk considerations apply."))
                            .missingProtections(node.path("missing_protections").asText("Standard commercial protections recommended."))
                            .suggestedRevision(node.path("suggested_revision").asText("Review standard terms with qualified counsel."))
                            .build();

                    clauseList.add(dto);
                }
            }
        } catch (ContractProcessingException cpe) {
            throw cpe;
        } catch (Exception e) {
            log.error("Failed to parse AI analysis response: {}", sanitizeMessage(e.getMessage()));
            throw new ContractProcessingException("Failed to parse AI risk analysis result. Please re-try.", e);
        }

        if (clauseList.isEmpty()) {
            throw new ContractProcessingException("AI analysis did not yield identifiable contract clauses.");
        }

        log.info("Successfully parsed {} analyzed clauses and contract summary.", clauseList.size());
        return new AiAnalysisResult(summary, clauseList);
    }

    private String cleanJsonResponse(String raw) {
        String trimmed = raw.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        trimmed = trimmed.trim();

        int startObj = trimmed.indexOf('{');
        int endObj = trimmed.lastIndexOf('}');
        if (startObj >= 0 && endObj > startObj) {
            return trimmed.substring(startObj, endObj + 1);
        }

        int startArr = trimmed.indexOf('[');
        int endArr = trimmed.lastIndexOf(']');
        if (startArr >= 0 && endArr > startArr) {
            return trimmed.substring(startArr, endArr + 1);
        }

        return trimmed;
    }

    private String callGeminiWithRetry(String url, Map<String, Object> requestBody) {
        int maxRetries = 3;
        long[] waitSeconds = {5, 12, 25};

        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return aiWebClient.post()
                        .uri(url)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofSeconds(90))
                        .block();
            } catch (WebClientResponseException e) {
                if ((e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS || e.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE) && attempt < maxRetries) {
                    long wait = waitSeconds[attempt];
                    log.warn("Gemini API {} encountered. Retry {}/{} in {}s...", e.getStatusCode(), attempt + 1, maxRetries, wait);
                    try {
                        Thread.sleep(wait * 1000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new ContractProcessingException("AI analysis interrupted during rate limit retry.", ie);
                    }
                } else if (e.getStatusCode() == HttpStatus.UNAUTHORIZED || e.getStatusCode() == HttpStatus.FORBIDDEN) {
                    throw new ContractProcessingException("Invalid or unauthorized Gemini API key. Please verify server credentials.");
                } else {
                    log.error("Gemini API HTTP Error status: {}", e.getStatusCode());
                    throw new ContractProcessingException("External AI service error: " + e.getStatusCode());
                }
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    log.warn("AI service call failed on attempt {}. Retrying in 3s...", attempt + 1);
                    try {
                        Thread.sleep(3000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new ContractProcessingException("AI analysis interrupted.", ie);
                    }
                } else {
                    log.error("AI service communication failure after {} attempts: {}", maxRetries, sanitizeMessage(e.getMessage()));
                    throw new ContractProcessingException("Unable to contact AI risk analysis service. Please try again later.", e);
                }
            }
        }

        throw new ContractProcessingException("AI analysis service call exceeded maximum retries.");
    }

    private String sanitizeMessage(String message) {
        if (message == null) return "Unknown error";
        return message.replaceAll("key=[a-zA-Z0-9._-]+", "key=[REDACTED]");
    }
}
