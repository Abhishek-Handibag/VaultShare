from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from .models import OTP
import json
import random
import string

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
                return JsonResponse({'message': 'Login successful'})
            return JsonResponse({'error': 'OTP expired'}, status=400)
        except (User.DoesNotExist, OTP.DoesNotExist):
            return JsonResponse({'error': 'Invalid OTP'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)