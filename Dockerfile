FROM debian:latest


# ARG OAUTH_LINK
# ARG OAUTH_CLIENT_UID
# ARG OAUTH_SECRET
# ARG OAUTH_LINK
# ARG OAUTH_LINK
# ARG OAUTH_LINK

COPY transcendence /home/transcendence
RUN apt-get -y update && apt-get -y upgrade && apt-get -y install python3 pip
RUN pip install -r home/transcendence/requirements.txt --break-system-packages
RUN pip install pyOpenSSL --upgrade --break-system-packages
# RUN python3 /home/transcendence/manage.py migrate game
# RUN python3 /home/transcendence/manage.py migrate
WORKDIR /home/transcendence/
RUN chmod +x launch.sh

CMD ["bash", "launch.sh" ]