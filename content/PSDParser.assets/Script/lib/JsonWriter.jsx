function JsonWriter(env)
{
	this.env = env;
}

JsonWriter.prototype.write = function(root)
{
    var file = new File(this.env.dataFolderPath + this.env.name + ".json");
    file.encoding = "UTF8";
    if(file.open("w") == true)
    {
        file.write(root.toJson(0, true));
        //alert(root.toJson());
        file.close();
    }
}
