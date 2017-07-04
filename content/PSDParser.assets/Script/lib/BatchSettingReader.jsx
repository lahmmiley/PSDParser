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
    if(file.open("r") == true)
    {
        do
        {
            var line = file.readln();
            this.parseLine();
        }while(line != String.empty)
        file.close();
    }
    else
    {
        throw("打开" + BATCH_SETTING_NAME + "批处理文件失败");
    }
}

BatchSettingReader.prototype.parseLine = function(line)
{
    var index = 0;
    while(true)
    {
        var result = BATCH_NAME_REG.exec(line);
        if(result == null) break;
        alert(result[1]);
    }
}