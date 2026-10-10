"""
Pipeline router that coordinates file processing through appropriate pipelines.
"""
from typing import Dict, Any, Optional
from app.core.errors import ProcessingException
from app.processors.file_validator import FileType, validate_upload_file
from app.processors.spreadsheet_processor import process_spreadsheet_file
from app.processors.quality_processor import process_invoice_quality
from app.processors.ocr_processor import process_document_with_ocr


from app.processors.invoice_extractor import InvoiceDataExtractor


class ProcessingPipeline:
    """Orchestrates the processing pipeline for uploaded files."""

    @staticmethod
    def process_file(
        file_data: bytes,
        filename: str,
        content_type: Optional[str] = None,
        max_size_mb: int = 15
    ) -> Dict[str, Any]:
        """
        Process an uploaded file through the appropriate pipeline.

        Returns a dictionary with processing results.
        """
        try:
            # Step 1: Validate the file
            file_type, storage_path = validate_upload_file(
                file_data, filename, max_size_mb
            )

            # Initialize result
            result = {
                "success": True,
                "filename": filename,
                "file_type": file_type.value,
                "storage_path": storage_path,
                "processing_steps": [],
                "extracted_data": None,
                "canonical_json": None,
                "provenance_json": None,
                "validation_json": None,
                "quality_assessment": None,
                "ocr_info": None
            }

            # Step 2: Route to appropriate pipeline based on file type
            if file_type in [FileType.CSV, FileType.TSV, FileType.XLSX]:
                # Pipeline B: Spreadsheet processing
                result["processing_steps"].append("spreadsheet_parsing")

                spreadsheet_result = process_spreadsheet_file(file_data, file_type)
                result["extracted_data"] = spreadsheet_result.get("data", {})
                result["processing_steps"].append("spreadsheet_processed")

                # If we got meaningful data, assess its quality
                if spreadsheet_result.get("success") and spreadsheet_result.get("data"):
                    quality_result = process_invoice_quality(spreadsheet_result["data"])
                    result["quality_assessment"] = quality_result
                    result["validation_json"] = quality_result
                    result["processing_steps"].append("quality_assessment")

                    # Use cleaned data if quality is good
                    if quality_result.get("cleaned_data"):
                        result["extracted_data"] = quality_result["cleaned_data"]

            elif file_type in [FileType.PDF, FileType.PNG, FileType.JPEG]:
                # Pipeline A: AI/OCR processing
                result["processing_steps"].append("ocr_processing")

                ocr_result = process_document_with_ocr(file_data, file_type)
                result["ocr_info"] = ocr_result
                result["processing_steps"].append("ocr_processed")

                if ocr_result.get("success"):
                    raw_text = ocr_result.get("text", "")
                    word_blocks = ocr_result.get("word_blocks", [])
                    lang_info = ocr_result.get("language_info", {})

                    # Extract structured invoice fields using InvoiceDataExtractor
                    extraction = InvoiceDataExtractor.extract(raw_text, word_blocks, lang_info)
                    result["extracted_data"] = extraction["extracted_fields"]
                    result["canonical_json"] = extraction["canonical"]
                    result["provenance_json"] = extraction["provenance"]
                    result["processing_steps"].append("invoice_fields_extracted")

                    # Run quality & deterministic validation
                    quality_result = process_invoice_quality(extraction["extracted_fields"])
                    result["quality_assessment"] = quality_result
                    result["validation_json"] = quality_result
                    result["processing_steps"].append("validation_completed")
                else:
                    result["extracted_data"] = {}

            else:
                # Unsupported file type for processing
                result["extracted_data"] = {}
                result["processing_steps"].append("unsupported_for_processing")

            # Step 3: Final validation
            if result["extracted_data"] is None:
                result["extracted_data"] = {}

            return result

        except ProcessingException:
            # Re-raise processing exceptions
            raise
        except Exception as e:
            raise ProcessingException(f"Unexpected error in processing pipeline: {str(e)}", "pipeline_error")


def process_uploaded_file(
    file_data: bytes,
    filename: str,
    content_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Convenience function to process an uploaded file.

    This is the main entry point for file processing.
    """
    return ProcessingPipeline.process_file(file_data, filename, content_type)