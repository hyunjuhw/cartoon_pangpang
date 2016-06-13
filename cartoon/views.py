from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Cartoon
from .models import Scene
from django.views.decorators.csrf import csrf_exempt
import base64
from django.shortcuts import render, get_object_or_404

# Create your views here.
def main_menu(request):
	return render(request, 'mainmenu.html')

def signup(request):
	if request.method == "POST":
		userform = UserCreationForm(request.POST)
		if userform.is_valid():
			userform.save()

			return HttpResponseRedirect(
				reverse("signup_ok")
			)
	elif request.method == "GET":
		userform = UserCreationForm()

	return render(request, "registration/signup.html", {
		"userform": userform,
		})

def gallery(request):
	my_cartoons = Cartoon.objects.filter(username=request.user)
	other_cartoons = Cartoon.objects.exclude(username=request.user)
	return render(request, 'gallery.html', {"my_cartoons" : my_cartoons, "other_cartoons" : other_cartoons})

def slideshow(request):
	ct_id = int(request.POST['ct_id'])
	current_cartoon = Cartoon.objects.get(ct_id=ct_id, username=request.user)
	scenes = Scene.objects.filter(ct_id = current_cartoon)
	return render(request, 'slideshow.html', {"scenes" : scenes})
	
def editor(request):
	count = Cartoon.objects.filter(username=request.user).count()
	cartoon = Cartoon(ct_id=count+1, username=str(request.user))
	cartoon.save()
	return render(request, "paint.html", { "ct_id" : count+1})

def save(request):
	print(request.user)
	img_val = request.POST['img_val']
	ct_id = int(request.POST['ct_id'])
	current_cartoon = Cartoon.objects.get(ct_id=ct_id, username=request.user)
	scene = Scene(ct_id=current_cartoon, ct_contents=img_val)
	scene.save()
	return render(request, "paint.html", {"ct_id" : ct_id})


def submit(request):
	return render(request, "submit.html", {})

def new_cartoon(request):
	if request.method == 'POST':
		form = CartoonForm(request.POST)
		if form.is_valid():
			cartoon = form.save(commit=False)
			cartoon.username = request.username
			cartoon.save()
			return redirect('cartoon.views.gallery', pk=cartoon.pk)
	else:
		form = CartoonForm()
	return render(request, 'mainmenu.html', {'cartoon': cartoon})