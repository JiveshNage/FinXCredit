import re
import hashlib

def validate_pan(pan: str) -> bool:
    """Rigorous regex to validate Indian PAN formats (5 Letters, 4 Numbers, 1 Letter)"""
    pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
    return bool(re.match(pattern, pan.upper()))

def validate_aadhaar(aadhaar: str) -> bool:
    """Simple length validation (Verhoeff algo omitted for mocking)"""
    return len(aadhaar) == 12 and aadhaar.isdigit()

def hash_kyc_data(data: str) -> str:
    """Never store raw PII if it can be avoided; hash it."""
    return hashlib.sha256(data.encode()).hexdigest()

def mock_uidai_ping(aadhaar: str, name: str) -> bool:
    """Mocks calling UIDAI or Karza to match identity."""
    # In production, this pings Aadhaar registry API
    if not validate_aadhaar(aadhaar):
        return False
    # Arbitrary mock logic: if Aadhaar ends in '0000', simulate blocked/fraud
    if aadhaar.endswith("0000"):
        return False
    return True
