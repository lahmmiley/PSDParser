const DUMMY_TOKEN_LIST = [/\#/g, /副本 \d*/g, /副本\d*/g, /拷贝 \d*/g, /拷贝\d*/g, /copy\d*/g];// /\./g, / /g, 

function BaseNode()
{
    this.descriptor = arguments[0];
    this.parent = arguments[1];
    this.children = [];
    this.layerIndex = -1;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;

	//解析参数
	this.parseLayerName();
}

//不放在类内部是因为类初始化就会用到这个函数，需要把函数定义在调用之前
BaseNode.prototype.parseLayerName = function()
{
    if(this.descriptor == null)
    {
        this.name = ROOT_NAME;
        this.type = TYPE_CONTAINER;
    }
    else
    {
		var layerName = this.descriptor.getString(ST("name"));
		for(var i = 0;i < DUMMY_TOKEN_LIST.length;i++)
		{
			layerName = layerName.replace(DUMMY_TOKEN_LIST[i], String.empty);
		}

	    new ParameterVerify().verifyChinese(this, layerName);
		this.setParam(layerName);
    }
}

BaseNode.prototype.setParam = function(layerName)
{
	var tokenList = layerName.split("|");
	if(this.type != null)
	{
		this.setName(tokenList[0]);
	}
	else
	{
		if(this.namedType(tokenList))
		{
			this.type = tokenList[0].removeBlank().toLowerCase();
			this.setName(tokenList[1]);
		}
		else
		{
			this.type = TYPE_CONTAINER;
			this.setName(tokenList[0]);
		}
	}
	
	for(var i = 1; i < tokenList.length; i++)
	{
		var token = tokenList[i].removeBlank();
		if(token.startWith("@"))
		{
			if(this.param == null) { this.param = String.empty }
			this.param += token.substring(1, token.length) + " ";
		}
	}
}

BaseNode.prototype.calculateBounds = function()
{
    var descBounds = this.descriptor.getObjectValue(ST("bounds"));
    var left = descBounds.getUnitDoubleValue(ST("left"));
    var top = descBounds.getUnitDoubleValue(ST("top"));
    var right = descBounds.getUnitDoubleValue(ST("right"));
    var bottom = descBounds.getUnitDoubleValue(ST("bottom"));
    this.x = left;
    this.y = top;
    this.width = right - left;
    this.height = bottom - top;
}

BaseNode.prototype.toJson = function(depth)
{
	var prefix = (TAB).repeat(depth * 3);
	var jsonStr = prefix + "{\n";
	jsonStr += prefix + TAB;
	jsonStr = this.addBaseProperty(jsonStr);
	jsonStr = this.addSpecifiedProperty(jsonStr);
	if(this.children.length == 0) jsonStr = jsonStr.substring(0, jsonStr.length - 2);//È¥µô¶ººÅ
	jsonStr += "\n";
	if(this.children.length > 0)
	{
		jsonStr += prefix + TAB + TAB + "\"Children\":\n";
		jsonStr += prefix + TAB + TAB + "[\n";
		var length = this.children.length;
		for(var i = 0; i < length; i++)
		{
			jsonStr += this.children[i].toJson(depth + 1);
			if(i != (length - 1))
			{
				jsonStr += ",";
			}
			jsonStr += "\n";
		}
		jsonStr += prefix + TAB + TAB + "]\n";
	}
	jsonStr += prefix + "}";
	return jsonStr;
}

BaseNode.prototype.addBaseProperty = function(content)
{
	content += this.getJsonFormatProperty("Name", this.name, false);
	content += this.getJsonFormatProperty("Type", this.type, false);
	content += this.getJsonFormatProperty("X", this.x, true);
	content += this.getJsonFormatProperty("Y", this.y, true);
	content += this.getJsonFormatProperty("Width", this.width, true);
	content += this.getJsonFormatProperty("Height", this.height, true);
	if(this.param != null)
	{
		var paramStr = this.param.toLowerCase()
		var paramList = paramStr.split(" ");
		for(var i = 0; i < paramList.length; i++)
		{
			var param = paramList[i];
			if(param.startWith(PARAMETER_ATTACH)) content += this.getJsonFormatProperty("Attach", 1, true);
			if(param.startWith(PARAMETER_HIDE)) content += this.getJsonFormatProperty("Hide", 1, true);
			if(param.startWith(PARAMETER_MASK)) content += this.getJsonFormatProperty("Mask", 1, true);
			if(param.startWith(PARAMETER_CANVAS)) content += this.getJsonFormatProperty("Canvas", 1, true);
		}
	}
	return content;
}

BaseNode.prototype.addSpecifiedProperty = function(content)
{
	return content;
}

BaseNode.prototype.getJsonFormatProperty = function(propertyName, propertyValue, isNumber)
{
	if(isNumber)
    {
        return "\"{0}\":{1}, ".format(propertyName, propertyValue);
    }
    else
    {
        return "\"{0}\":\"{1}\", ".format(propertyName, propertyValue);
    }
}

BaseNode.prototype.haveAttachParam = function()
{
	if(this.param == null)
	{
		return false;
	}
	var paramStr = this.param.toLowerCase()
	if(paramStr.indexOf(PARAMETER_ATTACH) != -1)
	{
		return true;
	}
	return false;
}

BaseNode.prototype.namedType = function(tokenList)
{
	if((tokenList.length > 1) && (!tokenList[1].startWith("@")))
	{
		return true;
	}
	return false
}

BaseNode.prototype.setBounds = function(x, y, width, height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

BaseNode.prototype.setName = function(name)
{
	this.name = name.trim()
}

BaseNode.prototype.getFullPath = function()
{
    var path = String.empty;
    var node = this.parent;
    while(node.name != ROOT_NAME)
    {
        path = node.name + "/" + path;
        node = node.parent;
    }
    path = path + this.name;
    return path;
}
