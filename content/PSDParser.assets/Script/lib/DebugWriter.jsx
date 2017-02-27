function DebugWriter()
{
}

DebugWriter.prototype.write = function(root)
{
	this.content = "";
    var path = app.activeDocument.path + "/" + "debugInfo.txt";
    var file = new File(path);
    file.encoding = "UTF8";
    if(file.open("w") == true)
    {
        this.getContent(root, "");
        file.write(this.content);
        file.close();
    }
}

DebugWriter.prototype.getContent = function(parent, indent)
{
    indent += "\t";
    for(var i = 0;i < parent.children.length;i++)
    {
        var node = parent.children[i];
        this.content += "\n" + indent + node.toString();
        if(node.type != "image" && node.type != "text")
        {
            this.getContent(node, indent);
        }
    }
}
