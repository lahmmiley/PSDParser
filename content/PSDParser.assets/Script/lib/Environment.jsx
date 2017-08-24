const PSD_NAME_SPLIT_TOKEN = "$";

function Environment(doc)
{
	this.doc = doc;
	this.width = doc.width;
	this.height = doc.height;
	this.name = this.getPsdName(doc.name).replace(/\.(psd|png)/i, "");
	var reg = /(.*)\/.*/;
	this.resourcesFolderPath = String(doc.path).replace(reg, '$1') + "/";
	this.imageFolderPath = this.resourcesFolderPath + "Image/";
    this.dataFolderPath = this.resourcesFolderPath + "Data/";
    this.imageDataFolderPath = this.resourcesFolderPath + "ImageData/";
    this.createFolder(this.imageFolderPath)
    this.createFolder(this.dataFolderPath)
    this.createFolder(this.imageDataFolderPath)
	new PropertyGetter(this);
    
	this.commonAssetMap = this.readAssets(this.imageFolderPath + COMMON);
	this.readBatchSetting();

	//设置新建裁剪面板的单位――像素
	app.preferences.rulerUnits = Units.PIXELS;
	app.preferences.typeUnits = TypeUnits.PIXELS;
}

Environment.prototype.getPsdName = function(rawName)
{
    var rawNameSplit = rawName.split(PSD_NAME_SPLIT_TOKEN);
	if(rawNameSplit.length == 2)
    {
        return rawNameSplit[1];
    }
	return rawName;
}

Environment.prototype.isBatch = function()
{
	return this.batchName != null;
}

Environment.prototype.readBatchSetting = function()
{
    var reader = new BatchSettingReader(this);
    var outputDict = reader.read();
	if(outputDict.hasOwnProperty(this.name))
	{
		this.batchName = outputDict[this.name];
		this.batchAssetMap = this.readAssets(this.imageFolderPath + this.batchName);
	}
	else
	{
		this.batchAssetMap = {};
	}
}

Environment.prototype.readAssets = function(path)
{
	var map = {}
    var folder = new Folder(path);
	if(folder.exists)
	{
        var files = folder.getFiles("*.png");
        for(var i = 0;i < files.length;i++)
        {
			var name = files[i].name;
			name = name.replace(PNG_POSTFIX, String.empty);
			map[name] = 1;
        }
	}
	return map;
}

Environment.prototype.createFolder = function(path)
{
    var folder = new Folder(path);
    if(!folder.exists)
    {
        folder.create();
    }
}
