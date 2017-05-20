#include "Base/BaseDefine.jsx";
#include "Base/BaseClass.jsx";
#include "Node/NodeType.jsx";
#include "Node/BaseNode.jsx";
#include "Node/FolderNode.jsx";
#include "Node/ImageNode.jsx";
#include "Node/TextNode.jsx";
#include "Tool/StringExtension.jsx";
#include "Extractor.jsx";
#include "FileWriter.jsx";
#include "ImageExporter.jsx";
#include "PropertyGetter.jsx";
#include "ParameterVerify.jsx";

function Environment(doc)
{
	this.doc = doc;
	this.width = doc.width;
	this.height = doc.height;
	this.name = this.getPsdName(doc.name).replace(/\.(psd|png)/i, "");
	var reg = /(.*)\/.*\/.*/;
	this.resourcesFolderPath = String(doc.path).replace(reg, '$1') + "/";
	this.imageFolderPath = this.resourcesFolderPath + "Image/";
    this.dataFolderPath = this.resourcesFolderPath + "Data/";
	new PropertyGetter(this);
	this.readCommonAssets();

	//设置新建裁剪面板的单位――像素
	app.preferences.rulerUnits = Units.PIXELS;
	app.preferences.typeUnits = TypeUnits.PIXELS;
}

Environment.prototype.getPsdName = function(rawName)
{
    var rawNameSplit = rawName.split("$");
	if(rawNameSplit.length == 2)
    {
        return rawNameSplit[1];
    }
	return rawName;
}

Environment.prototype.readCommonAssets = function()
{
	this.commonAssetMap = {};
	var commonAssetPath = this.imageFolderPath + COMMON;
    var folder = new Folder(commonAssetPath);
	if(folder.exists)
	{
        var files = folder.getFiles("*.png");
        for(var i = 0;i < files.length;i++)
        {
			var name = files[i].name;
			name = name.replace(PNG_POSTFIX, String.empty);
			this.commonAssetMap[name] = 1;
        }
	}
}
