const COMMON = "Common";

String.empty = "";
String.prototype.repeat = function(n)
{
	return new Array(n + 1).join(this);
}

String.prototype.startWith = function(str)
{     
  var reg=new RegExp("^" + str);     
  return reg.test(this);        
}

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
	this.readCommonAssets();

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
			name = name.replace(".png", String.empty);
			this.commonAssetMap[name] = 1;
        }
	}
}
