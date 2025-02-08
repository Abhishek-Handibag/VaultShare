from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse  # Add HttpResponse import
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from .models import OTP
import json
import random
import string
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import File
from .crypto_utils import generate_key, encrypt_file, decrypt_file, encrypt_key, decrypt_key
from django.core.files.base import ContentFile
import base64

def set_token_cookies(response, token):
    """Helper function to set JWT cookies"""
    response.set_cookie(
        'access_token',
        token['access'],
        max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
        httponly=settings.JWT_COOKIE_HTTPONLY,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE
    )
    response.set_cookie(
        'refresh_token',
        token['refresh'],
        max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
        httponly=settings.JWT_COOKIE_HTTPONLY,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE
    )

@csrf_exempt
def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            name = data.get('name', '')
            
            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Email already registered'}, status=400)
            
            # Create user with email as both username and email
            user = User.objects.create_user(
                username=email.lower(),  # ensure lowercase username
                email=email.lower(),     # ensure lowercase email
                password=password,
                first_name=name
            )
            return JsonResponse({'message': 'Registration successful'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            
            # Ensure we use lowercase email for authentication
            email = email.lower()
            
            # First try to authenticate with provided credentials
            user = authenticate(username=email, password=password)
            
            if user is None:
                # If authentication fails, check if user exists
                try:
                    user_obj = User.objects.get(email=email)
                    return JsonResponse({'error': 'Invalid password'}, status=401)
                except User.DoesNotExist:
                    return JsonResponse({'error': 'Email not registered'}, status=401)
            
            # Generate OTP for successful authentication
            otp = ''.join(random.choices(string.digits, k=6))
            OTP.objects.create(user=user, otp_code=otp)
            
            # Send OTP via email
            send_mail(
                'Login OTP',
                f'Your OTP is: {otp}',
                'handibag.developer@gmail.com',
                [email],
                fail_silently=False,
            )
            return JsonResponse({'message': 'OTP sent to email'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def forgot_password(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            try:
                user = User.objects.get(email=email)
                # Generate reset token
                reset_token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
                OTP.objects.create(user=user, otp_code=reset_token)
                
                # Send reset link
                reset_link = f'http://localhost:3000/reset-password?token={reset_token}&email={email}'
                send_mail(
                    'Password Reset',
                    f'Click here to reset your password: {reset_link}',
                    'handibag.developer@gmail.com',
                    [email],
                    fail_silently=False,
                )
                return JsonResponse({'message': 'Password reset link sent'})
            except User.DoesNotExist:
                return JsonResponse({'error': 'Email not found'}, status=404)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def reset_password(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            token = data.get('token')
            email = data.get('email')
            new_password = data.get('password')
            
            try:
                user = User.objects.get(email=email)
                otp_obj = OTP.objects.filter(
                    user=user, 
                    otp_code=token,
                    is_verified=False
                ).latest('created_at')
                
                if otp_obj.is_valid():
                    user.set_password(new_password)
                    user.save()
                    otp_obj.is_verified = True
                    otp_obj.save()
                    return JsonResponse({'message': 'Password reset successful'})
                return JsonResponse({'error': 'Reset token expired'}, status=400)
            except (User.DoesNotExist, OTP.DoesNotExist):
                return JsonResponse({'error': 'Invalid reset token'}, status=400)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def verify_otp(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')
        
        try:
            user = User.objects.get(email=email)
            otp_obj = OTP.objects.filter(user=user, otp_code=otp, is_verified=False).latest('created_at')
            
            if otp_obj.is_valid():
                otp_obj.is_verified = True
                otp_obj.save()
                
                # Generate tokens
                refresh = RefreshToken.for_user(user)
                tokens = {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
                
                response = JsonResponse({'message': 'Login successful'})
                set_token_cookies(response, tokens)
                return response
                
            return JsonResponse({'error': 'OTP expired'}, status=400)
        except (User.DoesNotExist, OTP.DoesNotExist):
            return JsonResponse({'error': 'Invalid OTP'}, status=400)

@csrf_exempt
def logout(request):
    if request.method == 'POST':
        response = JsonResponse({'message': 'Logged out successfully'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_auth(request):
    return JsonResponse({'isAuthenticated': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    try:
        file = request.FILES['file']
        password = request.POST['password']
        
        # Generate encryption key
        encryption_key = generate_key()
        
        # Encrypt file content
        file_content = file.read()
        encrypted_content = encrypt_file(file_content, encryption_key)
        
        # Encrypt the encryption key with user's password
        encrypted_key = encrypt_key(encryption_key, password)
        
        # Save encrypted file
        file_obj = File(
            owner=request.user,
            file_name=file.name,
            encryption_key=encrypted_key,
            file_size=file.size,
            content_type=file.content_type
        )
        file_obj.encrypted_file.save(
            f'{file.name}.encrypted',
            ContentFile(encrypted_content)
        )
        file_obj.save()
        
        return JsonResponse({'message': 'File uploaded successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_file(request, file_id):
    try:
        file_obj = File.objects.get(id=file_id, owner=request.user)
        password = request.GET.get('password')
        
        if not password:
            return JsonResponse({'error': 'Password is required'}, status=400)
            
        try:
            # Decrypt the encryption key
            encryption_key = decrypt_key(file_obj.encryption_key, password)
            
            # Decrypt file content
            encrypted_content = file_obj.encrypted_file.read()
            decrypted_content = decrypt_file(encrypted_content, encryption_key)
            
            response = HttpResponse(
                decrypted_content,
                content_type=file_obj.content_type
            )
            response['Content-Disposition'] = f'attachment; filename="{file_obj.file_name}"'
            return response
        except Exception as e:
            return JsonResponse({'error': 'Invalid password or decryption failed'}, status=400)
            
    except File.DoesNotExist:
        return JsonResponse({'error': 'File not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_files(request):
    files = File.objects.filter(owner=request.user).values(
        'id', 'file_name', 'file_size', 'uploaded_at'
    )
    return JsonResponse({'files': list(files)})