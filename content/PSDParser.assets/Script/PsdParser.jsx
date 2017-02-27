#include "lib/Node/BaseNode.jsx";
#include "lib/Node/FolderNode.jsx";
#include "lib/Node/ImageNode.jsx";
#include "lib/Node/TextNode.jsx";
#include "lib/Environment.jsx";
#include "lib/Extractor.jsx";
#include "lib/DebugWriter.jsx";
#include "lib/FileWriter.jsx";
#include "lib/ImageExporter.jsx";
#include "lib/MessageSender.jsx";
#include "lib/PropertyGetter.jsx";

function inherit(p)
{
    function f() {};
    f.prototype = p;
    return new f();
}

function defineSubClass(superClass, constructor)
{
    constructor.prototype = inherit(superClass.prototype);
    constructor.prototype.constructor = constructor;
}

function main()
{
	if(app.documents.length == 0)
    {
        alert("未找到可解析的Psd文件！");
        return;
    }

	var env = new Environment(app.activeDocument);
	var root = new Extractor().extract();
	var path = env.dataFolderPath + env.name + ".json";
	//new FileWriter(env).write(path, root.toJson(0, true));
	//new ImageExporter(env).export(root);
}

main();
