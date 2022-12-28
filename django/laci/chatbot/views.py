from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from .backend.backend import BACKEND

import json

from django.http import JsonResponse

# Create your views here.

def index(request):
    return render(request, "test.html")

def bot(request):
    return render(request, "index.html")

## POST Requests ##

@csrf_exempt
def answer(request):
    if request.method == "POST":
        data = json.loads(request.body.decode())
        qid = data.get("id")
        answer = data.get("answer")
        BACKEND.filterOnQuestion(qid, answer)
    return JsonResponse(BACKEND.returnState())

@csrf_exempt
def skipQuestion(request):
    if request.method == "POST":
        data = json.loads(request.body.decode())
        qid = data.get("id")
        BACKEND.skipQuestion(qid)
    return JsonResponse(BACKEND.returnState())

@csrf_exempt
def resetQs(request):
    if request.method == "POST":
        BACKEND.resetState()
    return JsonResponse(BACKEND.returnState())

@csrf_exempt
def requestProject(request):
    return JsonResponse(BACKEND.returnState())

@csrf_exempt
def reInitMaven(request):
    if request.method == "POST":
        BACKEND.checkForDependencies()
        BACKEND.filterOnDependencies()
        BACKEND.getConflicts()
    return JsonResponse(BACKEND.returnState())

@csrf_exempt
def setPath(request):
    if request.method == "POST":
        data = json.loads(request.body.decode())
        path = data.get("path")
        BACKEND.setPath(path)
        BACKEND.checkForDependencies()
        BACKEND.filterOnDependencies()
        BACKEND.getConflicts()
    return JsonResponse(BACKEND.returnState())

@csrf_exempt
def setLicense(request):
    if request.method == "POST":
        data = json.loads(request.body.decode())
        lic = data.get("id")
        BACKEND.setLicense(lic)
    return JsonResponse(BACKEND.returnState())

@csrf_exempt
def getConflicts(request):
    if request.method == "POST":
        BACKEND.getConflicts()
    return JsonResponse(BACKEND.returnState())

@csrf_exempt
def testURL(request):
    BACKEND.setPath("C:\\Users\\Trevor Alt\\Documents\\GitHub\\LACI_Chatbot\\example_projects\\p_conflict")
    BACKEND.checkForDependencies()
    #BACKEND.filterOnQuestion(7, "Y")
    BACKEND.getConflicts()
    return JsonResponse(BACKEND.returnState())

    
