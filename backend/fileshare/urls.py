from django.urls import path
from . import views

urlpatterns = [
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
    path('share-file/<int:file_id>/', views.share_file, name='share_file'),
    path('create-share-link/<int:file_id>/', views.create_share_link, name='create_share_link'),
    path('shared/<uuid:token>/', views.access_shared_file, name='access_shared_file'),
    path('shared-files/', views.list_shared_files, name='list_shared_files'),
    path('delete-file/<int:file_id>/', views.delete_file, name='delete_file'),
    path('revoke-access/<int:file_id>/', views.revoke_file_access, name='revoke_file_access'),
    path('expire-link/<uuid:token>/', views.expire_share_link, name='expire_share_link'),
]
