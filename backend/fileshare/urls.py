from django.urls import path
from . import views

urlpatterns = [
    # ...existing code...
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('verify-auth/', views.verify_auth, name='verify_auth'),
    path('logout/', views.logout, name='logout'),
    path('upload-file/', views.upload_file, name='upload_file'),
    path('download-file/<int:file_id>/', views.download_file, name='download_file'),
    path('list-files/', views.list_files, name='list_files'),
]
