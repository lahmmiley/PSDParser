#include "lib/Base/BaseDefine.jsx";
#include "lib/Base/BaseClass.jsx";
#include "lib/Tool/StringExtension.jsx";

#include "lib/Environment.jsx";
#include "lib/Extractor.jsx";
#include "lib/FileWriter.jsx";
#include "lib/ImageExporter.jsx";
#include "lib/MessageSender.jsx";
#include "lib/PropertyGetter.jsx";

function main()
{
	if(app.documents.length == 0)
    {
        alert("没有打开psd文件！");
        return;
    }

	var env = new Environment(app.activeDocument);
	var root = new Extractor(env).extract();
	var path = env.dataFolderPath + env.name + JSON_POSTFIX;
	new FileWriter(env).write(path, root.toJson(0, true));
	new ImageExporter(env).export(root);
	//TODO
	//new MessageSender().sendMessage();
}

main();
