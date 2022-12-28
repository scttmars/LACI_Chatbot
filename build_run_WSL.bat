IF NOT %2.==. GOTO SkipBuild
rm ./build/static/js/main.*

rm ./build/static/css/main.*

IF NOT %1.==. GOTO SkipInstall
CALL npm install

:SkipInstall
CALL npm run build
echo DONE BUILD

:SkipBuild
cp ./build/static/js/main.*.js ./build/static/js/main.js 

cp ./build/static/css/main.*.css ./build/static/css/main.css

cp ./build/static/js/main.js ./django/laci/chatbot/javascript/static/js/main.js
cp ./build/static/js/main.js ./django/laci/chatbot/templates/main.js

cp ./build/static/css/main.css ./django/laci/chatbot/javascript/static/css/main.css
cp ./build/static/css/main.css ./django/laci/chatbot/templates/main.css

cd django/laci

py manage.py runserver 8000
