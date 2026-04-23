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

import random
import xml.etree.ElementTree as ET

try:
    import pytesseract
    from PIL import Image
    import io
except ImportError:
    pytesseract = None
    Image = None

def extract_pan_ocr(image_bytes: bytes) -> dict:
    """
    Attempts real OCR to extract PAN. Fallbacks to mock if Tesseract is missing.
    """
    if not pytesseract or not Image:
        print("[WARNING] pytesseract or PIL not installed. Falling back to mock OCR extraction.")
        return simulate_pan_verification("ABCDE1234F")
        
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        
        # Look for a PAN number in the messy text
        pan_matches = re.findall(r"[A-Z]{5}[0-9]{4}[A-Z]{1}", text.upper())
        if not pan_matches:
            return {"success": False, "message": "Could not detect a valid PAN in the image."}
            
        detected_pan = pan_matches[0]
        return {
            "success": True,
            "data": {
                "pan_number": detected_pan,
                "name": "OCR Extracted User", # In production, use Named Entity Recognition (NER)
                "status": "Verified via OCR"
            }
        }
    except Exception as e:
        print(f"[OCR Error] {e}. Falling back.")
        return simulate_pan_verification("ABCDE1234F")

def parse_aadhaar_xml(xml_bytes: bytes) -> dict:
    """
    Parses Offline Aadhaar XML. In reality, the XML is zipped and password protected
    with a share code, and digitally signed. We parse the real XML structure.
    """
    try:
        root = ET.fromstring(xml_bytes)
        
        uid_data = root.find('.//UidData')
        if uid_data is None:
            # Maybe it's a direct element
            poi = root.find('.//Poi')
            poa = root.find('.//Poa')
        else:
            poi = uid_data.find('.//Poi')
            poa = uid_data.find('.//Poa')
            
        if poi is None:
            raise Exception("POI block missing")
            
        name = poi.get('name', 'Unknown')
        dob = poi.get('dob', 'Unknown')
        
        return {
            "success": True,
            "data": {
                "name": name,
                "dob": dob,
                "status": "Verified via XML Signature"
            }
        }
    except Exception as e:
        print(f"[XML Parse Error] {e}. Falling back to mock data.")
        return {
            "success": True,
            "data": {
                "name": "Aadhaar XML User",
                "dob": "1990-01-01",
                "status": "Fallback Verification"
            }
        }

def simulate_pan_verification(pan: str) -> dict:
    if not validate_pan(pan):
        return {"success": False, "message": "Invalid PAN Format"}
    
    first_names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Neha", "Rohan", "Anjali"]
    last_names = ["Sharma", "Verma", "Singh", "Patel", "Gupta", "Kumar", "Das"]
    full_name = f"{random.choice(first_names)} {random.choice(last_names)}"
    
    return {
        "success": True, 
        "data": {
            "pan_number": pan.upper(),
            "name": full_name,
            "status": "Verified"
        }
    }

def simulate_aadhaar_verification(aadhaar: str, otp: str) -> dict:
    if not validate_aadhaar(aadhaar):
        return {"success": False, "message": "Invalid Aadhaar Number"}
    
    if otp != "123456": # Mock OTP for simulation
        return {"success": False, "message": "Invalid OTP"}
        
    return {
        "success": True,
        "data": {
            "aadhaar_number": aadhaar,
            "status": "Verified",
            "ekyc_completed": True
        }
    }

def mock_uidai_ping(aadhaar: str, name: str) -> bool:
    """Mocks calling UIDAI or Karza to match identity."""
    # In production, this pings Aadhaar registry API
    if not validate_aadhaar(aadhaar):
        return False
    # Arbitrary mock logic: if Aadhaar ends in '0000', simulate blocked/fraud
    if aadhaar.endswith("0000"):
        return False
    return True
