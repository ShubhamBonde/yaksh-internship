from django.urls import include, path
from uploader import views
urlpatterns = [
    path('', views.index, name="home"),
    path('start-exam/', views.start_exam, name="start-exam"),
    path('post', views.postAction, name='postAction')
]
