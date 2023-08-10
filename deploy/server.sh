#!/bin/bash
DJANGODIR=$(dirname $(cd $(dirname $0) && pwd))
DJANGO_SETTINGS_MODULE=camera.settings
cd $DJANGODIR
source env/bin/activate
export DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
exec env/bin/python manage.py runserver 0:8000
