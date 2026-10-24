package com.campushub.backend.service.ai;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class PdfTextExtractorServiceTest {

    private PdfTextExtractorService extractorService;

    @BeforeEach
    void setUp() {
        extractorService = new PdfTextExtractorService();
    }

    @Test
    @DisplayName("Should handle empty or null bytes gracefully")
    void testEmptyOrNullBytes() {
        ExtractedDocument nullDoc = extractorService.extractText((byte[]) null);
        assertNotNull(nullDoc);
        assertFalse(nullDoc.hasExtractableText());
        assertEquals(0, nullDoc.pageCount());
        assertNotNull(nullDoc.errorMessage());

        ExtractedDocument emptyDoc = extractorService.extractText(new byte[0]);
        assertNotNull(emptyDoc);
        assertFalse(emptyDoc.hasExtractableText());
    }

    @Test
    @DisplayName("Should handle corrupted bytes without crashing")
    void testCorruptedBytes() {
        byte[] corruptedData = "Not A Real PDF File Content".getBytes();
        ExtractedDocument result = extractorService.extractText(corruptedData);

        assertNotNull(result);
        assertFalse(result.hasExtractableText());
        assertNotNull(result.errorMessage());
    }

    @Test
    @DisplayName("Should successfully extract text from a valid generated PDF document")
    void testValidPdfTextExtraction() throws IOException {
        byte[] samplePdf = createSamplePdf("CampusHub Computer Networks: TCP Congestion Control and Slow Start mechanisms.");

        ExtractedDocument result = extractorService.extractText(samplePdf);

        assertNotNull(result);
        assertTrue(result.hasExtractableText());
        assertEquals(1, result.pageCount());
        assertTrue(result.text().contains("TCP Congestion Control"));
        assertNull(result.errorMessage());
    }

    private byte[] createSamplePdf(String sampleText) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                stream.beginText();
                stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                stream.newLineAtOffset(50, 700);
                stream.showText(sampleText);
                stream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }
}
