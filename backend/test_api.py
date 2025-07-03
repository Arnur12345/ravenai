#!/usr/bin/env python3
"""
Simple API test script to verify AfterTalk authentication endpoints
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_register():
    """Test user registration"""
    try:
        user_data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "testpassword123"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        print(f"Register: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"User created: {data['user']['name']} ({data['user']['email']})")
            print(f"Access token: {data['access_token'][:20]}...")
            return data['access_token']
        else:
            print(f"Registration failed: {response.text}")
            return None
    except Exception as e:
        print(f"Registration test failed: {e}")
        return None

def test_login():
    """Test user login"""
    try:
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        print(f"Login: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Login successful: {data['user']['name']}")
            return data['access_token']
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login test failed: {e}")
        return None

def test_profile(token):
    """Test getting user profile"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        print(f"Profile: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Profile: {data['name']} ({data['email']})")
            return True
        else:
            print(f"Profile failed: {response.text}")
            return False
    except Exception as e:
        print(f"Profile test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("AfterTalk API Test Suite")
    print("=" * 50)
    
    # Test health endpoint
    print("\n1. Testing Health Endpoint...")
    if not test_health():
        print("❌ Server is not running or health endpoint failed")
        print("Please start the backend server: cd backend/src && python main.py")
        sys.exit(1)
    
    print("✅ Health check passed")
    
    # Test registration
    print("\n2. Testing User Registration...")
    token = test_register()
    if token:
        print("✅ Registration passed")
    else:
        print("⚠️  Registration failed (user might already exist)")
    
    # Test login
    print("\n3. Testing User Login...")
    login_token = test_login()
    if login_token:
        print("✅ Login passed")
        token = login_token
    else:
        print("❌ Login failed")
        if not token:
            sys.exit(1)
    
    # Test profile
    print("\n4. Testing User Profile...")
    if test_profile(token):
        print("✅ Profile retrieval passed")
    else:
        print("❌ Profile retrieval failed")
    
    print("\n" + "=" * 50)
    print("🎉 API Integration Tests Complete!")
    print("Frontend can now connect to: http://localhost:8000")
    print("=" * 50)

if __name__ == "__main__":
    main() 