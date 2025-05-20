
/*
=================================================================

##############################################################



##############################################################

=================================================================
*/

//  ファイル関連の操作を提供するオブジェクトを取得
const fs = require('fs');

var inputJsonFile;
var outputFolder;
var outputPumlPrefix;

if (process.argv.length >= 5) {
	inputJsonFile = process.argv[2];
	outputFolder = process.argv[3];
	outputPumlPrefix = process.argv[4];
	console.log( "inputjson : " + inputJsonFile );
	console.log( "outputFolder : " + outputFolder );
	console.log( "outputPumlPrefix : " + outputPumlPrefix );
} else {
	console.log( "Usage: node jsondata2puml.js <input.json> outputFolder outputprefix" );
	console.log( "(出力時は outputprefixで指定された名前のフォルダができ、その中で prefix_main.puml などのファイルが複数出力される）" );
	process.exit(1);
}

var obj = JSON.parse(readJsonFile(inputJsonFile));

var outputbuf = {};
var dataBlockNo = 0;

outputbuf[getOutputFileName(outputPumlPrefix, "main")] = convObj2puml(null, -1, obj, 1);

outputPlantUmls();

function readJsonFile(inputJsonFile) {
	console.log("readJsonFile: inputJsonFile=" + inputJsonFile);
	return fs.readFileSync(inputJsonFile, 'utf-8');
}

function getOutputFileName(origname, appendname) {
	const words = origname.split(".");
	var retname = "";
	for(var i=0; i < words.length; i++) {
		if (i <= 0) retname = retname + words[i] + "_" + paddingZero(dataBlockNo, 3) + "_" + appendname;
		else retname = retname + "." + words[i];
	}
	dataBlockNo++;
	return outputFolder + "/" + outputPumlPrefix + "/" + retname + ".puml";
}


function appendStarterAndEnder(orig) {
	const styleStr = "<style>\nroot {\n  FontSize 11\n}\n</style>\n\n";
	return "@startuml\n\n" + styleStr + orig + "@enduml\n";
}


function convObj2puml(name, idx, obj, depth) {
	var resultbuf = [];
	var resultbufidx = 0;
	var localbuf = "";
	// console.log("convObj2puml: obj=" + JSON.stringify(obj) );

	var objname = "";
	if ( name != null ) objname = name;
	else objname = "Payload";

	// "data" という名称のオブジェクトを見つけたらそれ以降は特別な処理を実行
	if (typeof obj == 'object' && obj != null && objname == "data") {
		localbuf = localbuf + "object " + objname + " {\n";
		for (const prop in obj) {
			const propval = obj[prop];

			// プロパティの型がobjectかつnullでない場合 → 型はobjectか配列になる
			if( typeof propval == 'object' && propval != null) {
				// 配列の場合
				if (Array.isArray(propval)) {
					// 配列の中にobjectが入っている場合
					if (typeIsObjectInsideArray(propval)) {
						var ary = propval;
						depth++;

						var result = "";
						result = result + "object " + prop + "{\n" ;
						result = result + "}\n" ;
						result = result + objname + " --> " + prop + " : " + prop + "\n\n";
						resultbuf.push(result);
						resultbufidx++;

						for (var idx=0; idx < ary.length; idx++) {
							const o = ary[idx];
							const subobjname = prop + "_" + idx ;
							result = result + convObj2puml(subobjname, idx, o, depth);
							result = result + prop + " --> " + subobjname + " : " + prop + "[" + idx  + "]" + "\n\n";
						}

						outputbuf[getOutputFileName(outputPumlPrefix, prop)] = result; 
					} 
					else {
						localbuf = localbuf + getPropertyDefLine(objname, prop, propval);
					}
				} 
				// オブジェクトの場合
				else {
					var result = convObj2puml(prop, idx, propval, ++depth);
					result = result + objname + " --> " + prop + " : " + prop + "\n\n";

					outputbuf[getOutputFileName(outputPumlPrefix, prop)] = result; 

					result = "object " + prop + "{\n" ;
					result = result + "}\n" ;
					result = result + objname + " --> " + prop + " : " + prop + "\n\n";
					resultbuf.push(result);
					resultbufidx++;
				}
			}
			else {
				localbuf = localbuf + getPropertyDefLine(objname, prop, propval);
			}
		}
		localbuf = localbuf + "}\n\n";

		if ( resultbufidx > 0 ) {
			for(var i=0; i < resultbufidx; i++) {
				localbuf = localbuf + resultbuf[i];
			}
		}
		return localbuf;
	}

	if (depth > 2) {
		const jsonstr = JSON.stringify(obj).slice(1).slice(0, -1);
		localbuf = localbuf + "json " + name + " { \n";
		localbuf = localbuf + "\t" + jsonstr + "\n";
		localbuf = localbuf + "}\n\n";
		return localbuf; 
	}

	if (typeof obj == 'object') {
		// 配列の場合
		if (Array.isArray(obj)) {
			console.log("  convObj2puml: Arrayの処理" );
			var ary = obj;
			depth++;
			for (var idx=0; idx < ary.length; idx++) {
				const o = ary[idx];
				const result = convObj2puml("MyArray_" + idx, idx, o, depth);
				resultbuf.push(result);
				resultbufidx++;
			}
		} 
		// オブジェクトの場合
		else {
			console.log("  convObj2puml: objectの処理");

			localbuf = localbuf + "object " + objname + " {\n";
			for (const prop in obj) {
				const propval = obj[prop];

				// プロパティの型がobjectかつnullでない場合 → 型はobjectか配列になる
				if( typeof propval == 'object' && propval != null) {
					// 配列の場合
					if (Array.isArray(propval)) {
						// 配列の中にobjectが入っている場合
						if (typeIsObjectInsideArray(propval)) {
							var ary = propval;
							depth++;

							var result = "";
							result = result + "object " + prop + "{\n" ;
							result = result + "}\n" ;
							result = result + objname + " --> " + prop + " : " + prop + "\n\n";
							resultbuf.push(result);
							resultbufidx++;

							for (var idx=0; idx < ary.length; idx++) {
								const o = ary[idx];
								const subobjname = prop + "_" + idx ;
								var result = convObj2puml(subobjname, idx, o, depth);
								result = result + prop + " --> " + subobjname + " : " + prop + "[" + idx  + "]" + "\n\n";
								resultbuf.push(result);
								resultbufidx++;
							}
						} 
						else {
							localbuf = localbuf + getPropertyDefLine(objname, prop, propval);
						}
					} 
					// オブジェクトの場合
					else {
						var result = convObj2puml(prop, idx, propval, ++depth);
						result = result + objname + " --> " + prop + " : " + prop + "\n\n";
						resultbuf.push(result);
						resultbufidx++;
					}
				}
				else {
					localbuf = localbuf + getPropertyDefLine(objname, prop, propval);
				}
			}
			localbuf = localbuf + "}\n\n";
		}
	}
	
	if ( resultbufidx > 0 ) {
		for(var i=0; i < resultbufidx; i++) {
			localbuf = localbuf + resultbuf[i];
		}
	}

	return localbuf;
}


function getPropertyDefLine(objname, prop, propval) {
	var propout = ""; 

	if ( typeof propval == 'object' && propval != null) {
		// 配列の場合
		if (Array.isArray(propval)) {
			console.log("  getPropertyLine" );

			propout = "\"[" ;
			var ary = propval;
			for (var idx=0; idx < ary.length; idx++) {
				if (idx > 0) {
					propout = propout + ", ";
				}
				propout = propout + ary[idx];
			}
			propout = propout + "]\"";
		} 
	} 
	// 
	else {
		if( typeof propval == 'string') {
			propout = "\"" + propval + "\"" ;
		} else if( typeof propval == 'number' || typeof propval == 'boolean'|| typeof propval == 'undefined' ) {
			propout = propval;
		}  else if( typeof propval == 'object' || propval == null) {
			propout = propval;
		}
	}

	return "\t" + objname + " : " + prop + " = " + propout + "\n";
}


function typeIsObjectInsideArray(ary) {
	const iobj = ary[0];
	if(typeof iobj == 'object' && iobj != null) {
		return true;
	} else {
		return false;
	}
}


// plantuml形式のテキストファイル出力
function outputPlantUmls() {
	// 新たにoutputFolder内のPrefixフォルダを作成
	makeDirectory(outputFolder + "/" + outputPumlPrefix);

	for (const propName in outputbuf) {
		const data = appendStarterAndEnder(outputbuf[propName]);

		fs.writeFileSync( propName, data );
	}
}

function makeDirectory(path) {
	console.log("makeDirectory(): path=" + path);

	fs.mkdirSync(path, { recursive: true }, (err) => {
		if (err) { console.log(JSON.stringify(err)); throw err; }
	});
}

/**
 * 
 * @param {*} num 
 * @param {*} numOfDigit 
 * @returns 
 */
function paddingZero(num, numOfDigit) {
	if (numOfDigit > 9) return "" + num;
	if (numOfDigit <= 0) return "" + num;

	var padded = "000000000" + num ;
	return padded.substring(padded.length - numOfDigit, padded.length);
}
