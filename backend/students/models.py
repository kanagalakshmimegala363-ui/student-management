
from django.db import models


class Student(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    course = models.CharField(max_length=100)
    age = models.PositiveIntegerField()

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.course})"

