const BATCH_SETTING_NAME = "BatchSetting.json"
const BATCH_NAME_REG = new RegExp("\"(.*?)\"", "g");
//去除冗余资源的方式就是把父文件删除后所有子文件重新生成

function BatchSettingReader(env)
{
	if(BatchSettingReader.unique != undefined)
	{
		return BatchSettingReader.unique;
	}
	BatchSettingReader.unique = this;
	this.env = env;
}

BatchSettingReader.prototype.read = function()
{
    var path = this.env.resourcesFolderPath + BATCH_SETTING_NAME;
    var file = new File(path);
	var outputDict = new Object();
    if(!file.exists)
    {
        return outputDict;
    }
    if(file.open("r") == true)
    {
        do
        {
            var line = file.readln();
            this.parseLine(outputDict, line);
        }while(line != String.empty)
        file.close();
        this.printDict()
    }
    else
    {
        throw("打开" + BATCH_SETTING_NAME + "合并处理文件失败");
    }
	return outputDict;
}

BatchSettingReader.prototype.parseLine = function(outputDict, line)
{
    var outputPath = null
    while(true)
    {
        var result = BATCH_NAME_REG.exec(line);
        if(result == null) break;
		var path = result[1];
		if(outputPath == null)
		{
			outputPath = path;
		}
		else
		{
			if(outputDict.hasOwnProperty(path))
			{
				throw("读取BatchSetting发现重复路径:" + path);
			}
			alert("path:" + path + "	outputPath:" + outputPath);
			outputDict[path] = outputPath;
		}
    }
}

BatchSettingReader.prototype.printDict = function(line)
{
    for(var key in this.nameToOutput)
    {
        alert("key:" + key + "  output:" + this.nameToOutput[key])
    }
}
