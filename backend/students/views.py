
from rest_framework import viewsets
from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    search_fields = ["name", "email", "course"]
    ordering_fields = ["name", "course", "age"]
    ordering = ["name"]

