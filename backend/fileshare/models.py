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

    def get_access_info(self):
        """Get file sharing and access information"""
        shared_with = FileShare.objects.filter(file=self).select_related('shared_with')
        # Only get valid (non-expired) share links
        share_links = FileShareLink.objects.filter(
            file=self,
            expires_at__gt=timezone.now()
        )
        
        return {
            'shared_with': [
                {
                    'email': share.shared_with.email,
                    'permission': share.permission,
                    'shared_at': share.created_at
                } for share in shared_with
            ],
            'share_links': [
                {
                    'token': str(link.token),
                    'expires_at': link.expires_at,
                    'created_at': link.created_at
                } for link in share_links
            ]
        }

    def can_access_without_password(self, user):
        """Check if user can access file without password"""
        return self.owner == user

    def revoke_access(self, user_email):
        """Revoke file access for a specific user"""
        FileShare.objects.filter(file=self, shared_with__email=user_email).delete()
        if not FileShare.objects.filter(file=self).exists():
            self.shared = False
            self.save()

    def get_complete_info(self):
        """Get comprehensive file information including sharing details"""
        access_info = self.get_access_info()
        now = timezone.now()
        return {
            'id': self.id,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'uploaded_at': self.uploaded_at,
            'owner': self.owner.email,
            'is_owner': True,
            'shared': self.shared,
            'shared_with': access_info['shared_with'],
            'share_links': [link for link in access_info['share_links'] if link['expires_at'] > now]
        }

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

    def expire_link(self):
        """Manually expire the share link"""
        self.expires_at = timezone.now()
        self.save()