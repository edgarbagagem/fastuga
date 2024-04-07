FROM php:8.1-fpm
# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

COPY fastuga-backend/application /var/www/laravel-backend/
RUN chown -R www-data:www-data /var/www
RUN chmod -R 775 /var/www
# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN ["chmod", "+x", "/var/www/laravel-backend/laravel_setup.sh"]
ENTRYPOINT ["bash", "/var/www/laravel-backend/laravel_setup.sh" ]