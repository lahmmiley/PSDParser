﻿#include "lib/Base/BaseDefine.jsx";
#include "lib/Base/BaseClass.jsx";
#include "lib/Node/NodeType.jsx";
#include "lib/Node/BaseNode.jsx";
#include "lib/Node/FolderNode.jsx";
#include "lib/Node/ImageNode.jsx";
#include "lib/Node/TextNode.jsx";
#include "lib/Tool/StringExtension.jsx";
#include "lib/Extractor.jsx";
#include "lib/FileWriter.jsx";
#include "lib/BatchSettingReader.jsx";
#include "lib/ImageExporter.jsx";
#include "lib/PropertyGetter.jsx";
#include "lib/Environment.jsx";
#include "lib/ParameterFactory.jsx";
#include "lib/VerifyManager.jsx";

function main(exportImage)
{
	if(app.documents.length == 0)
    {
        alert("未找到可解析的Psd文件！");
        return;
    }
	var env = new Environment(app.activeDocument);
	var root = new Extractor(env).extract();
    if(new VerifyManager().verify(root))
    {
        var dataPath = env.dataFolderPath + env.name + JSON_POSTFIX;
        new FileWriter().write(dataPath, root.toJson(0, true));
        if(exportImage)
        {
            new ImageExporter(env).export(root);
        }
    }
}
