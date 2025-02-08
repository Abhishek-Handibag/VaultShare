from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_valid(self):
        return timezone.now() <= self.created_at + timedelta(minutes=10)

class File(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    encrypted_file = models.FileField(upload_to='encrypted_files/')
    encryption_key = models.CharField(max_length=64)  # Store encrypted key
    file_size = models.IntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    content_type = models.CharField(max_length=100)