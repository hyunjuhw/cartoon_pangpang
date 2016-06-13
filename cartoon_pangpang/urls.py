"""cartoon_pangpang URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^signup/$', 'cartoon.views.signup', name='signup'),
    url(r'^signup_ok/$', TemplateView.as_view(
    	template_name='registration/signup_ok.html'
    	), name='signup_ok'),
    url(r'^$', 'django.contrib.auth.views.login', name='login_url'),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {
    		'next_page': '/login/',
    	}, name='logout_url'),
    url(r'^accounts/profile/$', 'cartoon.views.main_menu', name='main_menu'),
    url(r'^accounts/profile/gallery/$', 'cartoon.views.gallery', name='gallery'),
    url(r'^accounts/profile/gallery/slideshow/$', 'cartoon.views.slideshow', name='slideshow'),
    url(r'^accounts/profile/editor$', 'cartoon.views.editor', name='editor'),
    url(r'^accounts/profile/editor/save$', 'cartoon.views.save', name='save'),
    url(r'^accounts/profile/editor/submit$', 'cartoon.views.submit', name='submit'),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )