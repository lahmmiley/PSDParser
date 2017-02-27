function FileWriter(env)
{
	if(FileWriter.unique != undefined)
	{
		return FileWriter.unique;
	}
	this.env = env;
	FileWriter.unique = this;
}

FileWriter.prototype.write = function(path, content)
{
    var file = new File(path);
    file.encoding = "UTF8";
    if(file.open("w") == true)
    {
        file.write(content);
        file.close();
    }
}
