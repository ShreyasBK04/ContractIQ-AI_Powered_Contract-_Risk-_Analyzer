package com.contractrisk.service;

import com.contractrisk.exception.ContractProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * PDF extraction service operating in-memory using Apache PDFBox.
 * Reads input stream deterministically and closes all underlying document handles.
 */
@Service
@Slf4j
public class PdfExtractionService {

    private static final int MIN_TEXT_LENGTH = 30;
    private static final int MAX_CLAUSES_LIMIT = 50;

    /**
     * Extracts and segments contract clauses in memory from the uploaded PDF stream.
     * Uses try-with-resources to guarantee PDDocument and stream disposal.
     */
    public List<String> extractClauses(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided for text extraction.");
        }

        byte[] fileBytes;
        try (InputStream is = file.getInputStream()) {
            fileBytes = is.readAllBytes();
        } catch (IOException e) {
            throw new ContractProcessingException("Failed to read uploaded PDF input stream: " + e.getMessage(), e);
        }

        String rawText;
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            if (document.isEncrypted()) {
                throw new ContractProcessingException("The uploaded PDF is password-protected or encrypted. Please remove encryption before analysis.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            rawText = stripper.getText(document);
        } catch (IOException e) {
            throw new ContractProcessingException("Failed to parse PDF document structure. The file may be damaged or malformed.", e);
        } finally {
            // Null out byte array reference
            fileBytes = null;
        }

        if (rawText == null || rawText.trim().length() < MIN_TEXT_LENGTH) {
            throw new ContractProcessingException(
                    "No readable text found in the PDF. Scanned contracts without OCR text layers cannot be analyzed."
            );
        }

        log.info("Extracted text ({} characters). Segmenting into contract clauses...", rawText.length());
        return splitIntoClauses(rawText);
    }

    private List<String> splitIntoClauses(String text) {
        List<String> clauses = new ArrayList<>();

        // Primary segmentation: double newlines (paragraphs)
        String[] paragraphs = text.split("\\n\\s*\\n");
        for (String paragraph : paragraphs) {
            String trimmed = paragraph.trim();
            if (trimmed.length() < MIN_TEXT_LENGTH) {
                continue;
            }

            if (trimmed.length() > 600) {
                clauses.addAll(splitLongParagraph(trimmed));
            } else {
                clauses.add(trimmed);
            }
        }

        // Fallback segmentation if paragraphs yielded too few distinct sections
        if (clauses.size() < 2) {
            clauses.clear();
            String[] lines = text.split("\\n");
            StringBuilder current = new StringBuilder();

            for (String line : lines) {
                String trimmedLine = line.trim();
                if (trimmedLine.isEmpty()) {
                    if (current.length() >= MIN_TEXT_LENGTH) {
                        clauses.add(current.toString().trim());
                        current = new StringBuilder();
                    }
                } else {
                    current.append(trimmedLine).append(" ");
                }
            }
            if (current.length() >= MIN_TEXT_LENGTH) {
                clauses.add(current.toString().trim());
            }
        }

        log.info("Segmented contract into {} distinct clauses.", clauses.size());

        return clauses.stream()
                .filter(c -> c.length() >= MIN_TEXT_LENGTH)
                .limit(MAX_CLAUSES_LIMIT)
                .collect(Collectors.toList());
    }

    private List<String> splitLongParagraph(String paragraph) {
        List<String> result = new ArrayList<>();
        String[] sentences = paragraph.split("(?<=[.!?])\\s+(?=[A-Z0-9])");
        StringBuilder current = new StringBuilder();

        for (String sentence : sentences) {
            current.append(sentence).append(" ");
            if (current.length() > 250) {
                result.add(current.toString().trim());
                current = new StringBuilder();
            }
        }
        if (current.length() >= MIN_TEXT_LENGTH) {
            result.add(current.toString().trim());
        }

        return result;
    }
}
