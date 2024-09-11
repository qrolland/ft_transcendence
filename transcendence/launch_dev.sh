#!/bin/bash
python manage.py makemigrations game;
python manage.py makemigrations;
python manage.py migrate game;
python manage.py migrate;
python manage.py init_tasks;

daphne  -e ssl:8888:interface=bess-f2r2s6:privateKey=key.pem:certKey=cert.pem transcendence.asgi:application;
# daphne  -e ssl:8888:privateKey=key.pem:certKey=cert.pem transcendence.asgi:application;
