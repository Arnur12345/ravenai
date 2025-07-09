#!/usr/bin/env python3
"""
Debug script to test Google OAuth in real-time
"""
import asyncio
import sys
import os
from pathlib import Path
import httpx
import json

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from auth.google_oauth import google_oauth_service

async def test_real_google_oauth():
    """Test real Google OAuth flow"""
    print("🔍 Testing Google OAuth with real parameters...")
    
    # Test 1: Check service availability
    print(f"✅ Service available: {google_oauth_service.is_available}")
    
    if not google_oauth_service.is_available:
        print("❌ Google OAuth service is not available!")
        return
    
    # Test 2: Generate auth URL
    test_redirect_uri = "http://localhost:3000/auth/google/callback"
    test_state = "test_state_123"
    
    print(f"\n🔗 Generating auth URL...")
    print(f"   Redirect URI: {test_redirect_uri}")
    print(f"   State: {test_state}")
    
    try:
        auth_url = google_oauth_service.get_authorization_url(test_redirect_uri, test_state)
        print(f"✅ Auth URL generated successfully")
        print(f"   URL: {auth_url}")
        
        # Test 3: Test the callback endpoint directly
        print(f"\n🔍 Testing callback endpoint...")
        
        # Create a test request to the callback endpoint
        test_payload = {
            "code": "test_code_12345",
            "redirect_uri": test_redirect_uri,
            "state": test_state
        }
        
        print(f"   Test payload: {json.dumps(test_payload, indent=2)}")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:8000/api/auth/google/callback",
                json=test_payload,
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"   Response status: {response.status_code}")
            print(f"   Response text: {response.text}")
            
            if response.status_code != 200:
                print(f"❌ Callback endpoint failed with {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error details: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Raw error: {response.text}")
            else:
                print(f"✅ Callback endpoint responded successfully")
                
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_real_google_oauth()) 