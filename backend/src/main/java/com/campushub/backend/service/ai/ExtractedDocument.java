package com.campushub.backend.service.ai;

/**
 * Encapsulates the deterministic text extraction result from a PDF document.
 *
 * @param text               The raw extracted text, or empty string if unextractable.
 * @param pageCount          Total number of pages parsed from the PDF.
 * @param characterCount     Total character count of the extracted text.
 * @param isEncrypted        True if the PDF is password-protected or encrypted.
 * @param hasExtractableText True if the document contains meaningful extractable text (non-scanned).
 * @param errorMessage       Any warning or error encountered during extraction (null if successful).
 */
public record ExtractedDocument(
        String text,
        int pageCount,
        int characterCount,
        boolean isEncrypted,
        boolean hasExtractableText,
        String errorMessage
) {
    public static ExtractedDocument empty(String reason) {
        return new ExtractedDocument("", 0, 0, false, false, reason);
    }

    public static ExtractedDocument encrypted(int pageCount) {
        return new ExtractedDocument("", pageCount, 0, true, false, "Document is password protected or encrypted");
    }

    public static ExtractedDocument success(String text, int pageCount) {
        boolean hasContent = text != null && text.trim().length() >= 30;
        int len = text != null ? text.length() : 0;
        return new ExtractedDocument(
                text != null ? text : "",
                pageCount,
                len,
                false,
                hasContent,
                hasContent ? null : "Document appears to be scanned or contains insufficient extractable text"
        );
    }
}
