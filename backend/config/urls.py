
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def home(request):
    return JsonResponse({
        "message": "Student Management API is running successfully!",
        "status": "success",
        "api": "/api/",
        "admin": "/admin/"
    })


urlpatterns = [
    path("", home, name="home"),
    path("admin/", admin.site.urls),
    path("api/", include("students.urls")),
]

