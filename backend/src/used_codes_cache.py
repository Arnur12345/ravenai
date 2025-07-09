"""
Simple cache for tracking used OAuth codes to prevent replay attacks
"""

import time
from typing import Set

class UsedCodesCache:
    """Thread-safe cache to track used OAuth authorization codes"""
    
    def __init__(self, expiry_seconds: int = 600):  # 10 minutes
        self.used_codes: Set[str] = set()
        self.code_timestamps: dict = {}
        self.expiry_seconds = expiry_seconds
    
    def is_code_used(self, code: str) -> bool:
        """Check if authorization code has been used"""
        self._cleanup_expired_codes()
        return code in self.used_codes
    
    def mark_code_used(self, code: str) -> bool:
        """Mark authorization code as used. Returns False if already used."""
        self._cleanup_expired_codes()
        
        if code in self.used_codes:
            return False
        
        self.used_codes.add(code)
        self.code_timestamps[code] = time.time()
        return True
    
    def _cleanup_expired_codes(self):
        """Remove expired codes from cache"""
        current_time = time.time()
        expired_codes = [
            code for code, timestamp in self.code_timestamps.items()
            if current_time - timestamp > self.expiry_seconds
        ]
        
        for code in expired_codes:
            self.used_codes.discard(code)
            self.code_timestamps.pop(code, None)

# Global instance
used_codes_cache = UsedCodesCache() 