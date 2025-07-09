import json
import os
from typing import Optional, Dict, Any
import httpx
from google.auth.transport.requests import Request
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from fastapi import HTTPException, status
import secrets
import hashlib
import base64

from .schemas import GoogleUserInfo
from .exceptions import AuthenticationException


class GoogleOAuthService:
    def __init__(self):
        # Load Google OAuth credentials with enhanced error handling
        print("🔧 Initializing Google OAuth service...")
        
        self.credentials_file = self._find_credentials_file()
        self.is_available = False
        
        if not self.credentials_file:
            print("⚠️  Google OAuth credentials file not found - Google login will be disabled")
            print("   To enable Google OAuth, place your credentials file in the backend directory")
            print("   Expected files:")
            print("   - client_secret_1048775706645-jka3a5o69ltecsb69ogv0usjev21npvk.apps.googleusercontent.com.json")
            print("   - google_credentials.json")
            print("   - client_secret.json")
            self.credentials = None
            self.client_id = None
            self.client_secret = None
            self.redirect_uris = []
            self.auth_uri = None
            self.token_uri = None
            return
            
        try:
            print(f"📖 Loading credentials from: {self.credentials_file}")
            
            # Force reload credentials file with better error handling
            with open(self.credentials_file, 'r', encoding='utf-8') as f:
                self.credentials = json.load(f)
            
            print(f"✅ JSON file loaded successfully")
            
            # Validate required fields exist
            if 'web' not in self.credentials:
                raise ValueError("Credentials file missing 'web' section")
                
            web_config = self.credentials['web']
            required_fields = ['client_id', 'client_secret', 'redirect_uris', 'auth_uri', 'token_uri']
            missing_fields = [field for field in required_fields if field not in web_config]
            
            if missing_fields:
                raise ValueError(f"Credentials file missing required fields: {missing_fields}")
            
            self.client_id = web_config['client_id']
            self.client_secret = web_config['client_secret']
            self.redirect_uris = web_config['redirect_uris']
            self.auth_uri = web_config['auth_uri']
            self.token_uri = web_config['token_uri']
            
            # Debug: Print configuration details
            print(f"✅ Client ID: {self.client_id[:20]}...")
            print(f"✅ Client Secret: {self.client_secret[:20]}...")
            print(f"✅ Google OAuth allowed redirect URIs: {self.redirect_uris}")
            print(f"✅ Auth URI: {self.auth_uri}")
            print(f"✅ Token URI: {self.token_uri}")
            
            self.is_available = True
            print("🎉 Google OAuth service initialized successfully")
            
        except FileNotFoundError as e:
            print(f"❌ Credentials file not found: {str(e)}")
            print("   Google login will be disabled")
            self.is_available = False
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in credentials file: {str(e)}")
            print("   Google login will be disabled")
            self.is_available = False
        except ValueError as e:
            print(f"❌ Invalid credentials file format: {str(e)}")
            print("   Google login will be disabled")
            self.is_available = False
        except Exception as e:
            print(f"❌ Unexpected error loading Google OAuth credentials: {str(e)}")
            print(f"   Error type: {type(e).__name__}")
            print("   Google login will be disabled")
            self.is_available = False
        
    def _find_credentials_file(self) -> Optional[str]:
        """Find Google OAuth credentials file with enhanced debugging"""
        
        # Method 1: Use relative path from current file location
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(os.path.dirname(current_dir))  # Go up 2 levels: src -> backend
        
        print(f"🔍 Google OAuth credentials search:")
        print(f"   Current file: {__file__}")
        print(f"   Current dir: {current_dir}")
        print(f"   Backend dir calculated: {backend_dir}")
        
        # Check for the specific file you uploaded
        specific_filename = "client_secret_1048775706645-jka3a5o69ltecsb69ogv0usjev21npvk.apps.googleusercontent.com.json"
        specific_file = os.path.join(backend_dir, specific_filename)
        
        print(f"   Looking for specific file: {specific_file}")
        print(f"   Specific file exists: {os.path.exists(specific_file)}")
        
        if os.path.exists(specific_file):
            print(f"✅ Found Google OAuth credentials at: {specific_file}")
            return specific_file
            
        # Method 2: Alternative paths in case structure is different
        alternative_paths = [
            os.path.join(os.path.dirname(current_dir), specific_filename),  # One level up from auth/
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(current_dir))), specific_filename),  # Three levels up
            os.path.join(os.getcwd(), specific_filename),  # Current working directory
            os.path.join(os.getcwd(), "backend", specific_filename),  # CWD + backend
        ]
        
        print(f"   Trying alternative paths:")
        for i, alt_path in enumerate(alternative_paths):
            print(f"   Alt path {i+1}: {alt_path}")
            print(f"   Alt path {i+1} exists: {os.path.exists(alt_path)}")
            if os.path.exists(alt_path):
                print(f"✅ Found Google OAuth credentials at alternative path: {alt_path}")
                return alt_path
        
        # Check for generic credentials files in all locations
        generic_filenames = ["google_credentials.json", "client_secret.json"]
        all_search_dirs = [backend_dir] + [os.path.dirname(path) for path in alternative_paths]
        
        print(f"   Searching for generic files in directories:")
        for search_dir in all_search_dirs:
            print(f"   Directory: {search_dir}")
            for filename in generic_filenames:
                filepath = os.path.join(search_dir, filename)
                print(f"     Checking: {filepath}")
                if os.path.exists(filepath):
                    print(f"✅ Found generic credentials file: {filepath}")
                    return filepath
                
        print(f"❌ No Google OAuth credentials file found in any location")
        return None
    
    def _generate_pkce_challenge(self) -> Dict[str, str]:
        """Generate PKCE code verifier and challenge for enhanced security"""
        # Generate a cryptographically secure random code verifier
        code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
        
        # Create code challenge using SHA256
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode('utf-8')).digest()
        ).decode('utf-8').rstrip('=')
        
        return {
            'code_verifier': code_verifier,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
    
    def _check_availability(self):
        """Check if Google OAuth service is available"""
        if not self.is_available:
            raise AuthenticationException(
                status_code=503,
                detail="Google OAuth service is not available. Credentials file not found."
            )
    
    def get_authorization_url(self, redirect_uri: str, state: Optional[str] = None) -> str:
        """Generate Google OAuth authorization URL with enhanced security"""
        self._check_availability()
        
        try:
            print(f"🔍 Requested redirect URI: {redirect_uri}")
            print(f"🔍 Available redirect URIs: {self.redirect_uris}")
            
            # Validate that the redirect_uri is in our allowed list
            if redirect_uri not in self.redirect_uris:
                print(f"❌ Redirect URI validation failed!")
                raise AuthenticationException(
                    status_code=400,
                    detail=f"Invalid redirect URI: {redirect_uri}. Allowed URIs: {self.redirect_uris}"
                )
            
            print(f"✅ Redirect URI validation passed")
            
            # Use granular scopes for better permission management
            scopes = [
                'openid',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/calendar.readonly'
            ]
            
            # Create OAuth flow with enhanced security
            flow = Flow.from_client_config(
                self.credentials,
                scopes=scopes
            )
            flow.redirect_uri = redirect_uri
            
            print(f"🔍 Flow configured with redirect_uri: {flow.redirect_uri}")
            print(f"🔍 Using granular scopes: {scopes}")
            
            # Generate authorization URL with enhanced security parameters
            # Note: Removed PKCE for now as it may cause issues with Google OAuth
            auth_url, _ = flow.authorization_url(
                # Access type for refresh tokens
                access_type='offline',
                # Enable incremental authorization
                include_granted_scopes='true',
                # State parameter for CSRF protection
                state=state,
                # Prompt for consent to ensure fresh permissions
                prompt='consent'
            )
            
            print(f"🔗 Generated auth URL with enhanced security: {auth_url[:100]}...")
            print(f"🔒 Security features enabled: incremental auth, CSRF protection")
            
            return auth_url
            
        except AuthenticationException:
            raise
        except Exception as e:
            print(f"❌ Exception in get_authorization_url: {str(e)}")
            raise AuthenticationException(
                status_code=500,
                detail=f"Failed to generate authorization URL: {str(e)}"
            )

    async def exchange_code_for_tokens(self, code: str, redirect_uri: str, state: Optional[str] = None) -> Dict[str, Any]:
        """Exchange authorization code for access tokens with enhanced security"""
        self._check_availability()
        
        try:
            print(f"🔍 Starting token exchange:")
            print(f"  Code: {code[:20]}...")
            print(f"  Redirect URI: {redirect_uri}")
            print(f"  State: {state[:20] if state else 'None'}...")
            
            # Prepare token exchange request with enhanced security
            token_data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': redirect_uri,
            }
            
            print(f"🔍 Token request data prepared (without secrets)")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.token_uri,
                    data=token_data,
                    headers={'Content-Type': 'application/x-www-form-urlencoded'}
                )
                
                print(f"🔍 Token exchange response status: {response.status_code}")
                
                if response.status_code != 200:
                    error_detail = response.text
                    print(f"❌ Token exchange failed with status {response.status_code}: {error_detail}")
                    
                    # Try to parse error details
                    try:
                        error_json = response.json()
                        error_description = error_json.get('error_description', error_json.get('error', 'Unknown error'))
                        print(f"❌ Google OAuth error: {error_description}")
                        raise AuthenticationException(
                            status_code=400,
                            detail=f"Google OAuth error: {error_description}"
                        )
                    except:
                        raise AuthenticationException(
                            status_code=400,
                            detail=f"Token exchange failed: {error_detail}"
                        )
                
                token_response = response.json()
                print(f"✅ Token exchange successful")
                print(f"🔍 Token response keys: {list(token_response.keys())}")
                
                return token_response
                
        except httpx.RequestError as e:
            print(f"❌ Network error during token exchange: {str(e)}")
            raise AuthenticationException(
                status_code=500,
                detail=f"Network error during token exchange: {str(e)}"
            )
        except AuthenticationException:
            raise
        except Exception as e:
            print(f"❌ Exception in token exchange: {str(e)}")
            import traceback
            traceback.print_exc()
            raise AuthenticationException(
                status_code=500,
                detail=f"Failed to exchange code for tokens: {str(e)}"
            )
    
    async def get_user_info(self, access_token: str) -> GoogleUserInfo:
        """Get user information from Google using access token with enhanced error handling"""
        self._check_availability()
        
        try:
            # Use the updated userinfo endpoint with proper error handling
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                
                if response.status_code != 200:
                    error_detail = response.text
                    print(f"❌ Failed to get user info: {error_detail}")
                    raise AuthenticationException(
                        status_code=400,
                        detail=f"Failed to get user info: {error_detail}"
                    )
                
                user_data = response.json()
                print(f"✅ Successfully retrieved user info for: {user_data.get('email', 'unknown')}")
                
                return GoogleUserInfo(
                    id=user_data['sub'],  # Use 'sub' instead of 'id' for OAuth 2.0 compliance
                    email=user_data['email'],
                    name=user_data.get('name', ''),
                    avatar_url=user_data.get('picture'),
                    verified_email=user_data.get('email_verified', False)
                )
                
        except httpx.RequestError as e:
            print(f"❌ Network error getting user info: {str(e)}")
            raise AuthenticationException(
                status_code=500,
                detail=f"Network error getting user info: {str(e)}"
            )
        except Exception as e:
            print(f"❌ Exception getting user info: {str(e)}")
            raise AuthenticationException(
                status_code=500,
                detail=f"Failed to get user info: {str(e)}"
            )
    
    def verify_id_token(self, id_token_str: str) -> Dict[str, Any]:
        """Verify Google ID token and extract user info with enhanced security"""
        self._check_availability()
        
        try:
            print(f"🔍 Verifying ID token...")
            
            # Verify the token with enhanced security checks
            idinfo = id_token.verify_oauth2_token(
                id_token_str, 
                Request(), 
                self.client_id
            )
            
            print(f"✅ ID token signature verified")
            
            # Enhanced issuer verification for better security
            valid_issuers = ['accounts.google.com', 'https://accounts.google.com']
            if idinfo['iss'] not in valid_issuers:
                print(f"❌ Invalid token issuer: {idinfo['iss']}")
                raise ValueError(f'Invalid issuer: {idinfo["iss"]}. Expected one of: {valid_issuers}')
            
            # Verify audience matches our client ID
            if idinfo['aud'] != self.client_id:
                print(f"❌ Token audience mismatch: {idinfo['aud']}")
                raise ValueError(f'Invalid audience: {idinfo["aud"]}. Expected: {self.client_id}')
                
            # Check token expiration
            import time
            current_time = time.time()
            if idinfo['exp'] < current_time:
                print(f"❌ Token expired: {idinfo['exp']} < {current_time}")
                raise ValueError('Token has expired')
            
            # Check token not used before issued time
            if idinfo['iat'] > current_time:
                print(f"❌ Token issued in future: {idinfo['iat']} > {current_time}")
                raise ValueError('Token issued in the future')
            
            print(f"✅ ID token verified successfully for user: {idinfo.get('email', 'unknown')}")
            
            return idinfo
            
        except ValueError as e:
            print(f"❌ ID token validation error: {str(e)}")
            raise AuthenticationException(
                status_code=400,
                detail=f"Invalid ID token: {str(e)}"
            )
        except Exception as e:
            print(f"❌ Exception verifying ID token: {str(e)}")
            raise AuthenticationException(
                status_code=500,
                detail=f"Failed to verify ID token: {str(e)}"
            )


# Global instance
google_oauth_service = GoogleOAuthService() 