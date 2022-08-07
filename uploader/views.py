from django.shortcuts import render
from django.http import HttpResponseBadRequest, JsonResponse
import json
import datetime
# Create your views here.


def index(request):
    return render(request, 'index.html')


def start_exam(request):
    return render(request, 'index2.html')


def postAction(request):
    date = datetime.datetime.now()
    if request.method == 'POST':
        form_data = request.FILES['blobFile']
        filename = f'user_{date.strftime("%d_%b_%y_%I_%p_%M_%S")}.webm'
        source_file_name = f'./media/{filename}'
        with open(source_file_name, 'wb+') as destination:
            for chunk in form_data.chunks():
                destination.write(chunk)
        print('successful')

    else:
        print("POST request not recieved")
    return render(request, 'post.html')
