from django import forms

from .models import *

from bootstrap.forms import BootstrapForm
from registration.forms import RegistrationFormUniqueEmail
class RegistrationForm(RegistrationFormUniqueEmail, BootstrapForm):
    pass

class CartoonForm(forms.ModelForm):

    class Meta:
        model = Cartoon
        fields = ('ct', 'username',)

