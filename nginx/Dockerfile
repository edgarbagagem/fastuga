# Build frontend
FROM node:lts-alpine as frontend-build-stage
WORKDIR /app
COPY ../fastuga-frontend/package*.json ./
RUN npm install
COPY ../fastuga-frontend .
RUN echo -e "NODE_ENV=${NODE_ENV}\nVITE_API_DOMAIN=${VITE_API_DOMAIN}\nVITE_WS_CONNECTION=${VITE_WS_CONNECTION}" > .env.production
RUN npm run build


FROM nginx:alpine as production-stage
COPY --from=frontend-build-stage /app/dist /var/www/vue-frontend
COPY default.conf /etc/nginx/conf.d/default.conf
COPY fastcgi-php.conf /etc/nginx