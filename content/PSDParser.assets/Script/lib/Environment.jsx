function Environment(doc)
{
	this.doc = doc;
	this.width = doc.width;
	this.height = doc.height;
	this.name = this.getPsdName(doc.name).replace(/\.(psd|png)/i, "");
	this.resourcesFolderPath = String(doc.path).slice(0, -3);
	this.imageFolderPath = this.resourcesFolderPath + "Image/";
    this.dataFolderPath = this.resourcesFolderPath + "Data/";
	new PropertyGetter(this);

	//设置新建裁剪面板的单位——像素
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
