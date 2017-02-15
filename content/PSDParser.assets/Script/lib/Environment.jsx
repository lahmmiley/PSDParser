function Environment(doc)
{
	this.doc = doc;
	this.name = this.getPsdName(doc.name).replace(/\.(psd|png)/i, "");
	this.resourcesFolderPath = String(doc.path).slice(0, -3);
	this.imageFolderPath = this.resourcesFolderPath + "Image/";
    this.dataFolderPath = this.resourcesFolderPath + "Data/";

	//�����½��ü����ĵ�λ��������
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
