#!/usr/bin/env bash
cd /var/www/laravel-backend

echo "Installing composer dependencies"

composer install

echo "Generating application key"
rm -rf .env
echo "APP_ENV=$APP_ENV" >> .env
echo "APP_NAME=$APP_NAME" >> .env
echo "APP_DEBUG=$APP_DEBUG" >> .env
echo "APP_KEY=" >> .env
echo "DB_CONNECTION=$DB_CONNECTION" >> .env
echo "DB_HOST=$DB_HOST" >> .env
echo "DB_DATABASE=$DB_DATABASE" >> .env
echo "DB_USERNAME=$DB_USERNAME" >> .env
echo "DB_PASSWORD=$DB_PASSWORD" >> .env
echo "DB_SOCKET=$DB_SOCKET" >> .env
php artisan key:generate

cat .env

echo "Running database migrations"

php artisan migrate

#Uncomment if you want seeding
# echo "Checking if database needs seeding..."
# SEEDER_STATUS=$(php artisan tinker --execute="echo \App\Models\User::count();")

# if [ "$SEEDER_STATUS" -eq 0 ]; then
#   echo "No users found in the database. Seeding now..."
#   php artisan db:seed 
# else
#   echo "Database has already been seeded."
# fi


echo "Linking storage"
php artisan storage:link
chown -R www-data:www-data storage/
chown -R www-data:www-data boostrap/cache
chmod -R 775 storage/
chmod -R 775 boostrap/cache

CLIENT_COUNT=$(php artisan tinker --execute="echo \Laravel\Passport\Client::count();")

if [ "$CLIENT_COUNT" -eq 0 ]; then
  echo "No Passport clients found. Installing Passport."
  php artisan passport:install
else
  echo "Passport clients already exist."
fi

echo "Passport Keys"
php artisan passport:keys --force

php artisan serve --host=0.0.0.0 --port $PORT