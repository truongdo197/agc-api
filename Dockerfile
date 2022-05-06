FROM node

LABEL author="Amela"

WORKDIR /usr/app


ADD package*.json ./

RUN npm install


COPY . .

RUN npm run build

COPY ormconfig.js ./dist
COPY .env ./dist


WORKDIR ./dist

EXPOSE 3000

CMD node .index.js
