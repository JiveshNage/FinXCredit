import time
import random

def fetch_cibil_report(pan: str) -> int:
    """
    Mock integration mapping a PAN number to a pseudo-realistic CIBIL score (300-900).
    In production: Send API request to Experian/CIBIL with PAN + Consent logic.
    """
    # Deterministic mocking strategy based on PAN string for consistent dev testing
    if not pan:
        return -1 # NTC (New To Credit)
        
    char_sum = sum(ord(c) for c in pan)
    
    # Generate a score between 550 and 850 based on hashing the string
    score = 550 + (char_sum % 301)
    
    # Specific arbitrary triggers for debugging edge cases
    if pan.startswith("AAAAA"):
        return -1 # Trigger NTC manually
    if pan.startswith("XXXXX"):
        return 450 # Trigger massive default history
        
    return score
