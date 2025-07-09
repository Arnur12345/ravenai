#!/usr/bin/env python3
"""
Debug script to check state parameter flow
"""

import asyncio
import sys
import os
import aiohttp
import json

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

async def test_state_flow():
    """Test the state parameter flow"""
    
    print("🔧 Testing State Parameter Flow")
    print("=" * 50)
    
    # Test different state values
    test_cases = [
        "simple-state",
        "1735567123-abc123",
        "http://localhost:3000",  # This is what we're seeing in logs
        "test-state-123"
    ]
    
    base_url = "http://localhost:8000"
    redirect_uri = "http://localhost:3000/auth/google/callback"
    
    for state_value in test_cases:
        print(f"\n🔍 Testing state: '{state_value}'")
        print("-" * 40)
        
        try:
            # Test auth URL generation
            url = f"{base_url}/api/auth/google/auth-url"
            params = {
                "redirect_uri": redirect_uri,
                "state": state_value
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        auth_url = data.get("auth_url", "")
                        
                        print(f"✅ Auth URL generated successfully")
                        print(f"🔗 URL length: {len(auth_url)}")
                        
                        # Check if state is in the URL
                        if f"state={state_value}" in auth_url:
                            print(f"✅ State '{state_value}' found in auth URL")
                        else:
                            print(f"❌ State '{state_value}' NOT found in auth URL")
                            print(f"🔍 Auth URL: {auth_url[:200]}...")
                            
                        # Extract state from URL
                        import urllib.parse
                        parsed_url = urllib.parse.urlparse(auth_url)
                        query_params = urllib.parse.parse_qs(parsed_url.query)
                        url_state = query_params.get('state', [''])[0]
                        print(f"🔍 State in URL: '{url_state}'")
                        
                        if url_state == state_value:
                            print(f"✅ State matches expected value")
                        else:
                            print(f"❌ State mismatch! Expected: '{state_value}', Got: '{url_state}'")
                            
                    else:
                        print(f"❌ Request failed with status {response.status}")
                        error_text = await response.text()
                        print(f"Error: {error_text}")
                        
        except Exception as e:
            print(f"❌ Error testing state '{state_value}': {e}")
    
    print("\n🎯 Summary")
    print("=" * 50)
    print("If you see state mismatch, the problem is in the backend.")
    print("If all states match, the problem is in the frontend callback processing.")

if __name__ == "__main__":
    asyncio.run(test_state_flow()) 