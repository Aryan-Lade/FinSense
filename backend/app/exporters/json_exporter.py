"""
JSON exporter module.
"""
from typing import List, Dict, Any
import json


def export_invoices_to_json(invoices: List[Dict[str, Any]]) -> str:
    """Export complete invoice structures to indented JSON string."""
    return json.dumps(invoices, indent=2, default=str)
