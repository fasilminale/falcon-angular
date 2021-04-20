FROM node:15 as build
WORKDIR /usr/src/app

ARG env

EXPOSE 4200

COPY  . .
RUN npm install
RUN if [ -n "$env" ] ; then npm run build -- --configuration=$env ; else npm run build ; fi


FROM nginx:latest
COPY nginx-docker.conf /etc/nginx/nginx.conf

COPY dist/elm-chile-ui /usr/share/nginx/html
