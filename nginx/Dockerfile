# Build frontend
FROM node:lts-alpine as frontend-build-stage
WORKDIR /app
COPY fastuga-frontend/package*.json ./
RUN npm install
COPY fastuga-frontend .
RUN npm run build


FROM nginx:alpine as production-stage
COPY --from=frontend-build-stage /app/dist /var/www/vue-frontend
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/fastcgi-php.conf /etc/nginx