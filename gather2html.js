
/*
=================================================================

##############################################################



##############################################################

=================================================================
*/

//  ファイル関連の操作を提供するオブジェクトを取得
const fs = require('fs');
const path = require('path');

var outputFolder;
var outputPumlPrefix;
var dataTitle="";

if (process.argv.length >= 5) {
	outputFolder = process.argv[2];
	outputPumlPrefix = process.argv[3];
	dataTitle = process.argv[4];
	// console.log( "outputFolder : " + outputFolder );
	// console.log( "outputPumlPrefix : " + outputPumlPrefix );
} else {
	console.log( "Usage: node gather2html.js <outputFolder> <outputPumlPrefix> <dataTitle>" );
	console.log( "(出力時は outputFolder/outputPumlPrefix 配下に <outputPumlPrefix>_index.htmlが出力される)" );
	process.exit(1);
}

let g_svgfiles = {};
readSVGFiles(outputFolder, outputPumlPrefix);

outputHtml(outputFolder, outputPumlPrefix, dataTitle);


function readSVGFiles(outputFolder, outputPumlPrefix) {
	const dirPath = outputFolder + "/" + outputPumlPrefix;
	const fileNames = fs.readdirSync(dirPath);

	fileNames.forEach(fileName => {
		if ( fileName.endsWith(".svg") ) {
			// console.log("[" + fileName + "]\n" + file + "\n");
			const blockName = fileName.substring(outputPumlPrefix.length + 5, fileName.length - ".svg".length);
			g_svgfiles[blockName] = fileName;
		}
	});

}

function outputHtml(outputFolder, outputPumlPrefix, dataTitle) {
	// console.log("outputHtml");

	const prefix = "<html>\n<head>\n<title>" + dataTitle + "</title>\n</head>\n<body>\n"
	 + "<h2>" + dataTitle + "</h2>\n\n" ;
	const surfix = "\n</body>\n</html>\n";

	let data = prefix;

	for ( blockName in g_svgfiles ) {
		data = data + "<h3>" + blockName + "</h3>\n";
		data = data + "<img src=\"" + g_svgfiles[blockName]  + "\" />\n\n";
	}

	data = data + surfix;

	fs.writeFileSync( outputFolder + "/" + outputPumlPrefix + "/" + outputPumlPrefix + "_index.html", data );
}

