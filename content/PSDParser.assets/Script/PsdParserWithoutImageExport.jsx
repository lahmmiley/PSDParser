#include "lib/Environment.jsx";

function main()
{
	if(app.documents.length == 0)
    {
        alert("δ�ҵ��ɽ�����Psd�ļ���");
        return;
    }

	var env = new Environment(app.activeDocument);
	var root = new Extractor(env).extract();
    if(new ParameterVerify().verify(root))
    {
        var path = env.dataFolderPath + env.name + JSON_POSTFIX;
        new FileWriter(env).write(path, root.toJson(0, true));
    }
}

main();
