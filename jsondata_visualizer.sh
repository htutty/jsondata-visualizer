#!/bin/sh

if [ $# -le 3 ] 
then 
    echo "Usage: $0 <path/to/inputJSON> <outputFolder> <outputPumlPrefix> <dataDescription>"
    exit 1
fi

# plantuml.jar の参照パスを定義（各自の環境に合わせること）
PATH_TO_PLANTUML_JAR=~/plantuml/plantuml.jar

# JSON->PlantUMLへの変換ツールを使って .puml ファイルを出力する
node jsondata2puml.js $1 $2 $3

if [ $? -ne 0 ]
then
    echo "json translation action failed."
    exit 1
fi

# PlantUML により .puml ファイルを .svg ファイルに変換する
java -jar $PATH_TO_PLANTUML_JAR -svg $2/$3

if [ $? -ne 0 ]
then
    echo "plantUML action failed."
    exit 1
else
    # .svgが出てしまえば .pumlは不要になるので、削除する
    rm $2/$3/*.puml

    # .svg 単体だけだと読み辛いので、ひとまとめにした html を出力する
    node gather2html.js $2 $3 $4
fi
