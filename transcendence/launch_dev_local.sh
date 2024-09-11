#!/bin/bash
python3 manage.py makemigrations game;
python3 manage.py makemigrations;
python3 manage.py migrate game;
python3 manage.py migrate;
python3 manage.py init_tasks;
# python check_online.py &
# daphne  -e ssl:8888:interface=bess-f2r2s6:privateKey=key.pem:certKey=cert.pem transcendence.asgi:application;
daphne  -e ssl:8888:privateKey=key.pem:certKey=cert.pem transcendence.asgi:application;

# put
# import django.dispatch
# from django.dispatch import Signal

# # Return Truthy values to enable a specific request.
# # This allows users to build custom logic into the request handling
# # check_request_enabled = django.dispatch.Signal(
# #     providing_args=["request"]
# # )
# check_request_enabled = Signal()
# in
# /home/ggay/.local/lib/python3.10/site-packages/corsheaders
