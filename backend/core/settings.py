
# ... other settings ...

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'fileshare.views.CookieJWTAuthentication',
    ],
}

# Ensure these CORS settings are present
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]