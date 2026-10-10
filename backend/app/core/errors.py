"""
FinSense custom exceptions.
"""
from typing import Any, Dict, Optional


class FinSenseException(Exception):
    """Base exception for FinSense application."""
    
    def __init__(
        self,
        message: str,
        error_code: str = "internal_error",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(FinSenseException):
    """Exception raised for validation errors."""
    
    def __init__(
        self,
        message: str,
        field_path: Optional[str] = None,
        expected: Any = None,
        actual: Any = None,
    ):
        super().__init__(
            message=message,
            error_code="validation_error",
            details={
                "field_path": field_path,
                "expected": expected,
                "actual": actual,
            },
        )


class ProcessingException(FinSenseException):
    """Exception raised during document processing."""
    
    def __init__(
        self,
        message: str,
        document_id: Optional[str] = None,
        stage: Optional[str] = None,
    ):
        super().__init__(
            message=message,
            error_code="processing_error",
            details={
                "document_id": document_id,
                "stage": stage,
            },
        )


class StorageException(FinSenseException):
    """Exception raised during storage operations."""
    
    def __init__(self, message: str, file_path: Optional[str] = None):
        super().__init__(
            message=message,
            error_code="storage_error",
            details={"file_path": file_path},
        )


class AIException(FinSenseException):
    """Exception raised during AI processing."""
    
    def __init__(self, message: str, model: Optional[str] = None):
        super().__init__(
            message=message,
            error_code="ai_error",
            details={"model": model},
        )


class IntegrationException(FinSenseException):
    """Exception raised during integration with external services."""
    
    def __init__(self, message: str, service: Optional[str] = None):
        super().__init__(
            message=message,
            error_code="integration_error",
            details={"service": service},
        )
