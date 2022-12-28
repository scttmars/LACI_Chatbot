del .\build\static\css\main.*

IF NOT %1.==. GOTO SkipInstall
CALL npm install

:SkipInstall
CALL npm run build
echo DONE BUILD

:SkipBuild

ren .\build\static\js\main.*.js main.js 
ren .\build\static\css\main.*.css main.css

copy .\build\static\js\main.js .\django\laci\chatbot\javascript\static\js\
copy .\build\static\js\main.js .\django\laci\chatbot\templates\

copy .\build\static\css\main.css .\django\laci\chatbot\javascript\static\css\
copy .\build\static\css\main.css .\django\laci\chatbot\templates\

cd django\laci

py manage.py runserver 8000

cd ..\..