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
        file.write(this.toJson(root, 0, false));
        //alert(root.toJson());
        file.close();
    }
}

JsonWriter.prototype.toJson = function(node, depth, haveNext)
{
	var prefix = "";
	for(var i = 0; i < depth * 2;i++)
	{
		prefix += TAB;
	}
	var jsonStr = prefix + "{\n";
	jsonStr += prefix + "\"Name\":\"" + node.name + "\", \"Type\":\"" + node.type + 
						"\", \"X\":" + node.x + ", \"Y\":" + node.y +
						", \"Width\":" + node.width + ", \"Height\":" + node.height + ",\n";
	if(node.children.length > 0)
	{
		jsonStr += prefix + TAB + "\"Children\":\n";
		jsonStr += prefix + TAB + "[\n";
		var length = node.children.length;
		for(var i = 0; i < length; i++)
		{
			jsonStr += this.toJson(node.children[i], depth + 1, (i != (length - 1)));
		}
		jsonStr += prefix + TAB + "]\n";
	}
	else
	{
		jsonStr += prefix + TAB + "\"Children\":[ ]\n";
	}
	if(haveNext)
	{
		jsonStr += prefix + "},\n";
	}
	else
	{
		jsonStr += prefix + "}\n";
	}
	return jsonStr;
}
