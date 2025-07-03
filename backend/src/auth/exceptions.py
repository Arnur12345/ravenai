from fastapi import HTTPException, status


class AuthenticationException(HTTPException):
    """Base authentication exception"""
    def __init__(self, status_code: int = 500, detail: str = "Authentication error", headers=None):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class InvalidCredentialsException(AuthenticationException):
    """Exception raised when login credentials are invalid"""
    def __init__(self, message: str = "Invalid email or password"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"},
        )


class UserAlreadyExistsException(AuthenticationException):
    """Exception raised when trying to register with existing email"""
    def __init__(self, email: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email {email} already exists",
        )


class UserNotFoundException(AuthenticationException):
    """Exception raised when user is not found"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )


class InvalidTokenException(AuthenticationException):
    """Exception raised when token is invalid"""
    def __init__(self, message: str = "Invalid or expired token"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"},
        )


class InactiveUserException(AuthenticationException):
    """Exception raised when user account is inactive"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive",
        )


class PasswordResetTokenExpiredException(AuthenticationException):
    """Exception raised when password reset token is expired"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired",
        )


class PasswordResetTokenUsedException(AuthenticationException):
    """Exception raised when password reset token is already used"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has already been used",
        )


class OAuthException(AuthenticationException):
    """Exception raised when OAuth authentication fails"""
    def __init__(self, message: str = "OAuth authentication failed"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
