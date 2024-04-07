FROM node:lts-alpine
WORKDIR /app
COPY fastuga-websockets .
RUN npm install
EXPOSE 8080
CMD ["node", "index.js"]