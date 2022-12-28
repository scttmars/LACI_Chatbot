"""laci URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
import chatbot.views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', chatbot.views.bot),
    path('bot',chatbot.views.bot),

    path('answer', chatbot.views.answer),
    path('resetQs', chatbot.views.resetQs),
    path('requestProject', chatbot.views.requestProject),
    path('reInitMaven', chatbot.views.reInitMaven),
    path('setPath', chatbot.views.setPath),
    path('setLicense', chatbot.views.setLicense),
    path('skipQuestion', chatbot.views.skipQuestion),
    path('getConflicts', chatbot.views.getConflicts),

    path('test', chatbot.views.testURL)
    
]
