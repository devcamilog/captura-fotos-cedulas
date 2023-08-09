from django.shortcuts import render, redirect 
from django.http import HttpResponse, JsonResponse, HttpResponseForbidden
from django.template import Template, Context, RequestContext
from .models import Cedulas
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from PIL import Image
import os
from django.utils import timezone

# Create your views here.

def inicio(request):
    plantillaInicio = open("C:/Users/Apostar/Desktop/CAMERA_PROJECT/camera/templates/Appcamera/index.html")
    template = Template(plantillaInicio.read())
    plantillaInicio.close()
    contexto = Context()
    documento = template.render(contexto)
    return HttpResponse(documento)


@csrf_exempt
def guardar_imagen(request):
    if request.method == 'POST' and 'image' in request.FILES and 'cedula' in request.POST:
        image = request.FILES['image']
        cedula = request.POST['cedula']

        # Remover caracteres especiales de la cédula para evitar problemas en el nombre del archivo
        cleaned_cedula = cedula.replace('-', '').replace(' ', '')

        # Generar un nombre único para el archivo basado en la fecha, hora actual y número de cédula
        fecha_hora_actual = timezone.now().strftime('%Y%m%d_%H%M%S')
        nombre_archivo = f'{cleaned_cedula}_{fecha_hora_actual}.jpg'

        # Obtener la ruta completa en la red
        ruta_red = r'\\172.20.0.112\Public\FotosPV'
        ruta_completa = os.path.join(ruta_red, nombre_archivo)

        try:
            with open(ruta_completa, 'wb') as destination:
                for chunk in image.chunks():
                    destination.write(chunk)
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
