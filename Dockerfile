FROM node:latest

# Build client folder and copy to server/build
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/
COPY . .

WORKDIR /usr/src/app/client
RUN npm install
RUN npm run build


WORKDIR /usr/src/app/server
RUN rm -rf ./node_modules
RUN npm install

EXPOSE 8080

CMD ["npm", "start"]