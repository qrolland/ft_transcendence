#!/bin/bash
rm -rf static_file
python3 manage.py makemigrations game;
python3 manage.py makemigrations;
python3 manage.py migrate game;
python3 manage.py migrate;
python3 manage.py init_tasks;
python3 manage.py collectstatic;

daphne  -e ssl:8888:privateKey=key.pem:certKey=cert.pem transcendence.asgi:application;

