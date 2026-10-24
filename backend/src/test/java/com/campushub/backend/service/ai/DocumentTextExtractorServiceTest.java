package com.campushub.backend.service.ai;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class DocumentTextExtractorServiceTest {

    private DocumentTextExtractorService documentExtractorService;

    @BeforeEach
    void setUp() {
        PdfTextExtractorService pdfService = new PdfTextExtractorService();
        documentExtractorService = new DocumentTextExtractorService(pdfService);
    }

    @Test
    @DisplayName("Should extract text from Microsoft Word (.docx) files")
    void testDocxExtraction() throws IOException {
        byte[] docxBytes = createSampleDocx("CampusHub Software Engineering: Design Patterns and Architecture Tutorial.");

        ExtractedDocument result = documentExtractorService.extract("tutorial-notes.docx", docxBytes);

        assertNotNull(result);
        assertTrue(result.hasExtractableText());
        assertTrue(result.text().contains("Design Patterns and Architecture"));
        assertNull(result.errorMessage());
    }

    @Test
    @DisplayName("Should extract text from PowerPoint (.pptx) slides")
    void testPptxExtraction() throws IOException {
        byte[] pptxBytes = createSamplePptx("CampusHub Lecture Slides: Operating System Kernel and Scheduling.");

        ExtractedDocument result = documentExtractorService.extract("lecture-week-04.pptx", pptxBytes);

        assertNotNull(result);
        assertTrue(result.hasExtractableText());
        assertTrue(result.text().contains("Operating System Kernel and Scheduling"));
        assertEquals(1, result.pageCount());
        assertNull(result.errorMessage());
    }

    @Test
    @DisplayName("Should extract text from plain text (.txt) and markdown (.md)")
    void testPlainTextExtraction() {
        String content = "CampusHub Revision Notes: Quick summary of database normalization up to BCNF.";
        byte[] txtBytes = content.getBytes();

        ExtractedDocument result = documentExtractorService.extract("revision-guide.txt", txtBytes);

        assertNotNull(result);
        assertTrue(result.hasExtractableText());
        assertEquals(content, result.text());
        assertEquals(1, result.pageCount());
    }

    @Test
    @DisplayName("Should handle unsupported file types gracefully")
    void testUnsupportedFormat() {
        byte[] binaryData = new byte[]{0x1F, (byte) 0x8B, 0x08}; // gzip signature

        ExtractedDocument result = documentExtractorService.extract("archive.zip", binaryData);

        assertNotNull(result);
        assertFalse(result.hasExtractableText());
        assertTrue(result.errorMessage().contains("Unsupported file extension"));
    }

    private byte[] createSampleDocx(String text) throws IOException {
        try (XWPFDocument document = new XWPFDocument()) {
            XWPFParagraph paragraph = document.createParagraph();
            XWPFRun run = paragraph.createRun();
            run.setText(text);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.write(baos);
            return baos.toByteArray();
        }
    }

    private byte[] createSamplePptx(String text) throws IOException {
        try (XMLSlideShow ppt = new XMLSlideShow()) {
            XSLFSlide slide = ppt.createSlide();
            XSLFTextBox textBox = slide.createTextBox();
            XSLFTextParagraph paragraph = textBox.addNewTextParagraph();
            XSLFTextRun run = paragraph.addNewTextRun();
            run.setText(text);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ppt.write(baos);
            return baos.toByteArray();
        }
    }
}
