package com.campushub.backend.service.ai;

import org.apache.poi.xslf.extractor.XSLFExtractor;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Unified document text extraction service for CampusHub academic resources.
 * <p>
 * Supports multiple common academic formats without external API calls or LLM dependencies:
 * <ul>
 *     <li><b>PDF (.pdf)</b> via Apache PDFBox</li>
 *     <li><b>Word Documents (.docx)</b> via Apache POI</li>
 *     <li><b>PowerPoint Presentations (.pptx)</b> via Apache POI</li>
 *     <li><b>Plain Text & Notes (.txt, .md)</b> via native UTF-8 stream processing</li>
 * </ul>
 */
@Service
public class DocumentTextExtractorService {

    private static final Logger log = LoggerFactory.getLogger(DocumentTextExtractorService.class);

    private final PdfTextExtractorService pdfTextExtractorService;

    public DocumentTextExtractorService(PdfTextExtractorService pdfTextExtractorService) {
        this.pdfTextExtractorService = pdfTextExtractorService;
    }

    /**
     * Extracts text from file bytes based on the file name or extension.
     *
     * @param fileName Original file name or URL path (e.g., "lecture1.pdf", "tutorial.docx").
     * @param bytes    Raw binary content of the file.
     * @return ExtractedDocument containing text, page/slide count, and extraction status.
     */
    public ExtractedDocument extract(String fileName, byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            return ExtractedDocument.empty("Supplied file data is empty");
        }

        String extension = getFileExtension(fileName);
        log.info("Extracting document content for file '{}' (detected extension: '{}')", fileName, extension);

        return switch (extension.toLowerCase()) {
            case "pdf" -> pdfTextExtractorService.extractText(bytes);
            case "docx" -> extractDocx(bytes);
            case "pptx" -> extractPptx(bytes);
            case "txt", "md", "csv" -> extractPlainText(bytes);
            default -> {
                log.warn("Unsupported file format for AI text extraction: '{}'", extension);
                yield ExtractedDocument.empty("Unsupported file extension: ." + extension);
            }
        };
    }

    /**
     * Extracts text from an InputStream based on the file name.
     */
    public ExtractedDocument extract(String fileName, InputStream inputStream) {
        if (inputStream == null) {
            return ExtractedDocument.empty("Supplied InputStream is null");
        }
        try {
            byte[] bytes = inputStream.readAllBytes();
            return extract(fileName, bytes);
        } catch (IOException e) {
            log.error("Failed to read InputStream for {}: {}", fileName, e.getMessage());
            return ExtractedDocument.empty("Failed to read stream: " + e.getMessage());
        }
    }

    /**
     * Extracts text from a Microsoft Word (.docx) document.
     */
    private ExtractedDocument extractDocx(byte[] bytes) {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
             XWPFDocument doc = new XWPFDocument(bais);
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {

            String text = extractor.getText();
            int paragraphCount = doc.getParagraphs().size();
            // Estimate pages roughly based on paragraph density
            int estimatedPages = Math.max(1, paragraphCount / 5);

            log.info("Successfully extracted text from DOCX ({} paragraphs, ~{} pages, {} chars).",
                    paragraphCount, estimatedPages, text != null ? text.length() : 0);

            return ExtractedDocument.success(text, estimatedPages);
        } catch (Exception e) {
            log.error("Failed to extract text from DOCX file: {}", e.getMessage());
            return ExtractedDocument.empty("Failed to parse DOCX document: " + e.getMessage());
        }
    }

    /**
     * Extracts text from a Microsoft PowerPoint (.pptx) presentation.
     */
    private ExtractedDocument extractPptx(byte[] bytes) {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
             XMLSlideShow ppt = new XMLSlideShow(bais);
             XSLFExtractor extractor = new XSLFExtractor(ppt)) {

            String text = extractor.getText();
            int slideCount = ppt.getSlides().size();

            log.info("Successfully extracted text from PPTX ({} slides, {} chars).",
                    slideCount, text != null ? text.length() : 0);

            return ExtractedDocument.success(text, slideCount);
        } catch (Exception e) {
            log.error("Failed to extract text from PPTX file: {}", e.getMessage());
            return ExtractedDocument.empty("Failed to parse PPTX presentation: " + e.getMessage());
        }
    }

    /**
     * Extracts text from plain text or markdown files.
     */
    private ExtractedDocument extractPlainText(byte[] bytes) {
        String text = new String(bytes, StandardCharsets.UTF_8);
        return ExtractedDocument.success(text, 1);
    }

    /**
     * Helper to safely determine file extension.
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        // If fileName contains query params or URLs, strip them
        int queryIdx = fileName.indexOf('?');
        if (queryIdx != -1) {
            fileName = fileName.substring(0, queryIdx);
        }
        int dotIdx = fileName.lastIndexOf('.');
        return dotIdx != -1 ? fileName.substring(dotIdx + 1).trim() : "";
    }
}
