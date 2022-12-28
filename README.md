# Instructions to Run LACI

## Requirements

Before running LACI you must first install all of its dependencies.  LACI uses a React JS front end and a python Django back end.  As such you must first install Django:

`pip install Django`

In order to parse dependency information, you must also have Maven installed on your machine.  The installation should be configured in your PATH variables so that it can be run from the terminal.  Additionally, the dependency extractor relies on the Beautiful Soup python library.  You can install it with this command:

`pip install beautifulsoup4`

In order to compile the frontend, you must have npm installed (npm will automatically install all other frontend dependencies before compiling). You can download npm (and node.js) from: 

`https://nodejs.org/en/`


## Starting LACI

### On Windows

**Important:** use the command terminal and **NOT** Powershell.

Follow these steps:
- Navigate to the project directory
- Run build_run_Windows.bat in the terminal 
- After a message saying "Starting development server at..." is displayed, open http://127.0.0.1:8000/bot in a web browser.
	- It is recommended, but not required, that you set your browser's zoom to 150%
- To reset the run, press CTRL + C in the terminal window and then run the script again

### On MAC or Linux

Follow these steps:
- Navigate to the project directory
- Run ./build_run_WSL.bat 
- After a message saying "Starting development server at..." is displayed, open http://127.0.0.1:8000/bot in a web browser.
	- It is recommended, but not required, that you set your browser's zoom to 150%
- To reset the run, press CTRL + C in the terminal window and then run the script again

## Additional Information

Toy dependencies representing the various licenses LACI can recognize have been added into some example projects.  The example projects are found in the `example_projects` directory.  You can add and remove dependencies from the `pom.xml` files to determine the impact on the potential license sets.  The project `p_template` has a `pom.xml` containing all the different dependecnies annotated with their associated licenses.  A list of these dependencies, in a copy-pastable xml format, can also be found in `dependency_pom_sources.txt`.

## Important Commands
- help : Display a list of commands
- reinit : Make the chatbot parse dependencies for the project again informing the user of conflicts for dependencies and the selected license
- reset : Reset the answers to questions and the selected license

## Providing a Path
When providing a path, you should open the File Chooser and copy and paste the file path of the directory containing the projects `pom.xml` file.  Given limitations placed on JavaScript applications LACI is not able to obtain the full file path required by the system.

## Answering Questions
When answering questions, the chatbot expects simple, one-word answers like 'y', 'n', 'yes', and 'no', however, more complex replies can be made which cause the chatbot to attempt to find the closest matching question. 

## About this Repository
All back end code for this project can be found in the Django directory.  
Front end code is found in the \src directory and compiles to both the \django\laci\chatbot\javascript\static\js and \django\laci\chatbot\templates directories.




