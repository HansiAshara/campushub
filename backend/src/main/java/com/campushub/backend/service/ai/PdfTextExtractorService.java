package com.campushub.backend.service.ai;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

/**
 * Deterministic document text extraction service utilizing Apache PDFBox.
 * <p>
 * This service extracts raw text from PDF resources without invoking any external
 * AI or LLM models, guaranteeing zero cost and zero network overhead. It guards
 * against corrupted, encrypted, or image-only (scanned) PDFs and enforces page limits.
 */
@Service
public class PdfTextExtractorService {

    private static final Logger log = LoggerFactory.getLogger(PdfTextExtractorService.class);

    /**
     * Safety limit on the maximum number of pages parsed to avoid CPU/memory spikes on huge books.
     */
    private static final int MAX_EXTRACTABLE_PAGES = 100;

    /**
     * Extracts text from raw PDF bytes.
     *
     * @param pdfBytes Raw bytes of the PDF file.
     * @return ExtractedDocument containing the text, page count, and status flags.
     */
    public ExtractedDocument extractText(byte[] pdfBytes) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            log.warn("Attempted to extract text from empty or null byte array.");
            return ExtractedDocument.empty("Supplied file data is empty");
        }

        try (PDDocument document = Loader.loadPDF(new RandomAccessReadBuffer(pdfBytes))) {
            return processDocument(document);
        } catch (IOException e) {
            log.error("Failed to read or parse PDF bytes: {}", e.getMessage());
            return ExtractedDocument.empty("Failed to parse PDF: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during PDF extraction: {}", e.getMessage(), e);
            return ExtractedDocument.empty("Unexpected extraction error: " + e.getMessage());
        }
    }

    /**
     * Extracts text from an InputStream.
     *
     * @param inputStream Stream of PDF content.
     * @return ExtractedDocument containing the text, page count, and status flags.
     */
    public ExtractedDocument extractText(InputStream inputStream) {
        if (inputStream == null) {
            return ExtractedDocument.empty("Supplied InputStream is null");
        }

        try {
            byte[] bytes = inputStream.readAllBytes();
            return extractText(bytes);
        } catch (IOException e) {
            log.error("Failed to read bytes from InputStream: {}", e.getMessage());
            return ExtractedDocument.empty("Failed to read stream: " + e.getMessage());
        }
    }

    /**
     * Internal helper to extract text from an open PDDocument with safety guards.
     */
    private ExtractedDocument processDocument(PDDocument document) {
        int pageCount = document.getNumberOfPages();
        log.info("Processing PDF document containing {} pages.", pageCount);

        if (document.isEncrypted()) {
            log.warn("PDF document is encrypted or password-protected.");
            return ExtractedDocument.encrypted(pageCount);
        }

        try {
            PDFTextStripper textStripper = new PDFTextStripper();
            textStripper.setSortByPosition(true);

            // Cap the page processing to MAX_EXTRACTABLE_PAGES for resource safety
            if (pageCount > MAX_EXTRACTABLE_PAGES) {
                log.info("PDF has {} pages, capping extraction to first {} pages.", pageCount, MAX_EXTRACTABLE_PAGES);
                textStripper.setStartPage(1);
                textStripper.setEndPage(MAX_EXTRACTABLE_PAGES);
            }

            String extractedText = textStripper.getText(document);
            log.info("Extracted {} characters across {} pages.", 
                    extractedText != null ? extractedText.length() : 0, 
                    Math.min(pageCount, MAX_EXTRACTABLE_PAGES));

            return ExtractedDocument.success(extractedText, pageCount);
        } catch (IOException e) {
            log.error("Error during text stripping: {}", e.getMessage());
            return ExtractedDocument.empty("Failed to strip text from document: " + e.getMessage());
        }
    }
}
