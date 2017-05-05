#include "lib/Environment.jsx";

function main()
{
	if(app.documents.length == 0)
    {
        alert("未找到可解析的Psd文件！");
        return;
    }

	var env = new Environment(app.activeDocument);
	var root = new Extractor(env).extract();
	var path = env.dataFolderPath + env.name + JSON_POSTFIX;
	new FileWriter(env).write(path, root.toJson(0, true));
	new ImageExporter(env).export(root);
}

main();
