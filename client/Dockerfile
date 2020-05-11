FROM node:alpine
WORKDIR /srv/app
COPY package.json .
RUN yarn install
COPY . .
RUN yarn build

FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /srv/app/build  /usr/share/nginx/html
