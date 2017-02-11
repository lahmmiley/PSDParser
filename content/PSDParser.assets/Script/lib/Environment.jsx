function Environment(doc)
{
	this.doc = doc;
	this.PanelWidth = 1280;
	this.PanelHeight = 720;
	this.name = this.getPsdName(doc.name).replace(/\.(psd|png)/i, "");
	this.resourcesFolderPath = String(doc.path).slice(0, -3);
	this.imageFolderPath = this.resourcesFolderPath + "Image/";
    this.dataFolderPath = this.resourcesFolderPath + "Data/";

	//设置新建裁剪面板的单位——像素
	app.preferences.rulerUnits = Units.PIXELS;
	app.preferences.typeUnits = TypeUnits.PIXELS;
}

Environment.prototype.getPsdName = function(rawName)
{
    var rawNameSplit = rawName.split("$");
	return rawNameSplit[1];
}