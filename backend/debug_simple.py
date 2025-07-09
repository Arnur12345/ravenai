#!/usr/bin/env python3
"""
Simple debug script to identify state parameter issue
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from auth.google_oauth import google_oauth_service

# Test auth URL generation
redirect_uri = "http://localhost:3000/auth/google/callback"
state = "test-state-123"

print("🔍 Testing Google OAuth URL generation:")
print(f"  Redirect URI: {redirect_uri}")  
print(f"  State: {state}")

try:
    auth_url = google_oauth_service.get_authorization_url(redirect_uri, state)
    print(f"✅ Generated auth URL: {auth_url}")
    
    # Check if state is in the URL
    if f"state={state}" in auth_url:
        print("✅ State parameter found in URL")
    else:
        print("❌ State parameter NOT found in URL")
        
    # Check if redirect_uri is being used as state
    if f"state={redirect_uri}" in auth_url:
        print("❌ FOUND BUG: redirect_uri is being used as state!")
    else:
        print("✅ redirect_uri is not being used as state")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 