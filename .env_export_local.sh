#!bin/bash
export POSTGRES_PASSWORD=admin;
export POSTGRES_USER=admin;
export POSTGRES_DB=mydb;
export POSTGRES_HOST="127.0.0.1";
export POSTGRES_PORT=5432;

# export OAUTH_LINK="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-1d2e6b9454116ff20679ae57a7842c2f5168eea46f7c6e5a085762a88c96150d&redirect_uri=https%3A%2F%2Fbess-f2r2s6%3A8888%2Foauthlogin&response_type=code";
export OAUTH_LINK="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-5cf1d5e42b91535b46f4889e6ea12409b84a6b7912f94f7c6946518d6dd6253b&redirect_uri=https%3A%2F%2F127.0.0.1%3A8888%2Foauthlogin&response_type=code"
# export OAUTH_CLIENT_UID=u-s4t2ud-1d2e6b9454116ff20679ae57a7842c2f5168eea46f7c6e5a085762a88c96150d;
export OAUTH_CLIENT_UID=u-s4t2ud-5cf1d5e42b91535b46f4889e6ea12409b84a6b7912f94f7c6946518d6dd6253b
# export OAUTH_SECRET=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;
export OAUTH_SECRET=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
export OAUTH_LINK_REDIRECT=https://127.0.0.1:8888/oauthlogin;
export BASE_URL_HTTPS=https://127.0.0.1:8888;
export BASE_URL_WSS=wss://127.0.0.1:8888;