from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import uuid

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
    shared = models.BooleanField(default=False)
    
    def generate_share_link(self, expiry_hours=24):
        share_link = FileShareLink.objects.create(
            file=self,
            expires_at=timezone.now() + timedelta(hours=expiry_hours)
        )
        return share_link

class FileShare(models.Model):
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('download', 'Download')
    ]
    
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='shares')
    shared_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_files')
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

class FileShareLink(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='share_links')
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_valid(self):
        return timezone.now() <= self.expires_at