"""
Indian state codes for GST.
"""

# State code mapping as per GSTN
STATE_CODES = {
    "01": "Jammu & Kashmir",
    "02": "Himachal Pradesh",
    "03": "Punjab",
    "04": "Chandigarh",
    "05": "Uttarakhand",
    "06": "Haryana",
    "07": "Delhi",
    "08": "Rajasthan",
    "09": "Uttar Pradesh",
    "10": "Bihar",
    "11": "Sikkim",
    "12": "Arunachal Pradesh",
    "13": "Nagaland",
    "14": "Manipur",
    "15": "Mizoram",
    "16": "Tripura",
    "17": "Meghalaya",
    "18": "Assam",
    "19": "West Bengal",
    "20": "Jharkhand",
    "21": "Odisha",
    "22": "Chhattisgarh",
    "23": "Madhya Pradesh",
    "24": "Gujarat",
    "26": "Dadra & Nagar Haveli and Daman & Diu",
    "27": "Maharashtra",
    "29": "Karnataka",
    "30": "Goa",
    "31": "Lakshadweep",
    "32": "Kerala",
    "33": "Tamil Nadu",
    "34": "Puducherry",
    "35": "Andaman & Nicobar Islands",
    "36": "Telangana",
    "37": "Andhra Pradesh",
    "38": "Ladakh",
    "97": "Other Territory",
    "99": "Centre Jurisdiction",
}

# Reverse mapping for name to code (fuzzy matching would be implemented separately)
STATE_NAMES_TO_CODE = {name: code for code, name in STATE_CODES.items()}


def get_state_name(code: str) -> str:
    """Get state name from state code."""
    return STATE_CODES.get(code, "Unknown State")


def get_state_code(name: str) -> Optional[str]:
    """Get state code from state name (exact match)."""
    return STATE_NAMES_TO_CODE.get(name.strip())


def is_valid_state_code(code: str) -> bool:
    """Check if a state code is valid."""
    return code in STATE_CODES
