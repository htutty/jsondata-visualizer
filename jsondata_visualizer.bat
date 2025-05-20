
@rem translation JSON to PlantUML
node jsondata2puml.js %1 %2 %3

@rem translation to svg by plantuml
java -jar plantuml.jar -svg %2\%3

@rem delete puml files
del %2\%3\*.puml

@rem make index.html from SVG files
node gather2html.js %2 %3 %4
