#!/bin/bash
cd /var/www/laravel-backend
echo "Setting permissions for storage and cache..."

chown -R www-data:www-data storage bootstrap/cache
chmod -R o+w storage
chmod -R 775 bootstrap/cache
chmod -R 775 storage
echo "Permissions set."

echo "Installing composer dependencies"

composer install

echo "Generating application key"
rm -rf .env
echo "APP_KEY=" > .env
php artisan key:generate

echo "Running database migrations"

php artisan migrate

echo "Checking if database needs seeding..."
SEEDER_STATUS=$(php artisan tinker --execute="echo \App\Models\User::count();")

if [ "$SEEDER_STATUS" -eq 0 ]; then
  echo "No users found in the database. Seeding now..."
  php artisan db:seed 
else
  echo "Database has already been seeded."
fi


echo "Linking storage"
php artisan storage:link

CLIENT_COUNT=$(php artisan tinker --execute="echo \Laravel\Passport\Client::count();")

if [ "$CLIENT_COUNT" -eq 0 ]; then
  echo "No Passport clients found. Installing Passport."
  php artisan passport:install
else
  echo "Passport clients already exist."
fi


exec php-fpm