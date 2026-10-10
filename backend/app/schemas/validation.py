"""
Validation result schemas.
"""
from typing import Optional, List, Any
from pydantic import Field
from .base import BaseSchema


class ValidationResult(BaseSchema):
    """Single validation result."""
    rule_id: str = Field(..., description="Rule identifier like R004")
    rule_key: str = Field(..., description="Rule key like gstin_check_digit_valid")
    name: str = Field(..., description="Human-readable rule name")
    status: str = Field(..., description="passed|warning|failed|not_applicable")
    severity: str = Field(..., description="info|warning|error")
    field_path: Optional[str] = Field(None, description="JSON path to field")
    message: str = Field(..., description="Validation message")
    expected: Optional[Any] = Field(None, description="Expected value")
    actual: Optional[Any] = Field(None, description="Actual value")
    suggestion: Optional[Any] = Field(None, description="Suggested correction")


class ValidationReport(BaseSchema):
    """Complete validation report for an invoice."""
    validation_version: str = Field("1.0.0")
    status: str = Field(..., description="valid|warnings|invalid")
    results: List[ValidationResult] = Field(default_factory=list)
    errors: List[ValidationResult] = Field(default_factory=list)
    warnings: List[ValidationResult] = Field(default_factory=list)
    checks_passed: List[str] = Field(default_factory=list)
    
    @property
    def is_valid(self) -> bool:
        """Check if validation passed (no errors)."""
        return self.status == "valid"
    
    @property
    def has_warnings(self) -> bool:
        """Check if validation has warnings."""
        return len(self.warnings) > 0
    
    @property
    def has_errors(self) -> bool:
        """Check if validation has errors."""
        return len(self.errors) > 0
