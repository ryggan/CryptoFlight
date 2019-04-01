SERVER='37.139.0.80'

npm run build
cd build
ssh $SERVER "rm -rf /var/www/cryptoflight && mkdir /var/www/cryptoflight"
scp -r . $SERVER:/var/www/cryptoflight
