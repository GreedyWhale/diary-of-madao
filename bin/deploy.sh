cd /home/app/diary-of-madao &&
git reset --hard &&
git pull &&
docker-compose down &&
docker-compose up -d &&
echo 'OK!'
