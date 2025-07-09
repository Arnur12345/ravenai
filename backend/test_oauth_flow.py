#!/usr/bin/env python3
"""
Test script for Google OAuth flow debugging
"""

import asyncio
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from auth.google_oauth import google_oauth_service
from auth.service import auth_service

async def test_oauth_flow():
    """Test the complete OAuth flow"""
    
    print("🔧 Testing Google OAuth Flow")
    print("=" * 50)
    
    # Test 1: Check service availability
    print("1. Checking Google OAuth service availability...")
    if not google_oauth_service.is_available:
        print("❌ Google OAuth service not available")
        return
    print("✅ Google OAuth service is available")
    
    # Test 2: Generate auth URL with state
    print("\n2. Testing auth URL generation...")
    test_redirect_uri = "http://localhost:3000/auth/google/callback"
    test_state = "test-state-12345"
    
    try:
        auth_url = auth_service.get_google_auth_url(test_redirect_uri, test_state)
        print(f"✅ Auth URL generated successfully")
        print(f"🔗 URL length: {len(auth_url)} characters")
        print(f"🔗 URL preview: {auth_url[:100]}...")
        
        # Check if state is in the URL
        if test_state in auth_url:
            print(f"✅ State parameter '{test_state}' found in auth URL")
        else:
            print(f"❌ State parameter '{test_state}' NOT found in auth URL")
            print(f"🔍 Searching for 'state=' in URL...")
            if 'state=' in auth_url:
                # Extract state from URL
                state_start = auth_url.find('state=') + 6
                state_end = auth_url.find('&', state_start)
                if state_end == -1:
                    state_end = len(auth_url)
                actual_state = auth_url[state_start:state_end]
                print(f"🔍 Actual state in URL: '{actual_state}'")
            else:
                print("❌ No state parameter found in URL at all")
        
    except Exception as e:
        print(f"❌ Failed to generate auth URL: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Test 3: Check redirect URI validation
    print("\n3. Testing redirect URI validation...")
    invalid_redirect = "http://malicious.com/callback"
    
    try:
        auth_service.get_google_auth_url(invalid_redirect, test_state)
        print(f"❌ Invalid redirect URI was accepted (security issue!)")
    except Exception as e:
        print(f"✅ Invalid redirect URI properly rejected: {e}")
    
    # Test 4: Show expected vs actual behavior
    print("\n4. OAuth Flow Analysis:")
    print("=" * 30)
    print("Expected flow:")
    print("  1. Frontend generates random state: '1735567123-abc123'")
    print("  2. Frontend calls /api/auth/google/auth-url?state=1735567123-abc123")
    print("  3. Backend generates Google URL with state=1735567123-abc123")
    print("  4. Google redirects back with same state=1735567123-abc123")
    print("  5. Frontend verifies state matches stored value")
    print("")
    print("Current problem:")
    print("  - State in callback URL shows 'http://localhost:3000'")
    print("  - This suggests state is being overwritten somewhere")
    print("")
    print("Debugging suggestions:")
    print("  1. Check frontend request URL in browser network tab")
    print("  2. Check if Google OAuth app settings are correct") 
    print("  3. Verify redirect URI exactly matches Google console")
    print("  4. Test with a simple state value like 'test123'")

if __name__ == "__main__":
    asyncio.run(test_oauth_flow()) 