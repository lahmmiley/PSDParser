const DUMMY_TOKEN_LIST = [/\#/g, /副本 \d*/g, /副本\d*/g, /拷贝 \d*/g, /拷贝\d*/g, /copy\d*/g];

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
    this.paramList = new Array();

	//解析参数
	this.parseLayerName();
}

//不放在类内部是因为类初始化就会用到这个函数，需要把函数定义在调用之前
BaseNode.prototype.parseLayerName = function()
{
    this.initBaseInfo();
    this.initParam();
}

BaseNode.prototype.initBaseInfo = function(layerName)
{
    if(this.descriptor == null)
    {
        this.setBaseInfo(ROOT_NAME, TYPE_CONTAINER)
        return;
    }
    var layerName = this.getCleanLayerName();
	new ParameterVerify().verifyChinese(this, layerName);
	var tokenList = layerName.split(SPLIT_TOKEN);
    if(this.type != null) //Image 和 Text不需要设置类型
	{
		this.setName(tokenList[0]);
	}
	else
	{
		if(this.namedType(tokenList))
		{
            this.setBaseInfo(tokenList[0], tokenList[1]);
		}
		else
		{
            this.setBaseInfo(TYPE_CONTAINER, tokenList[0])
		}
	}
}

BaseNode.prototype.initParam = function()
{
    if(this.descriptor == null) return;
    var layerName = this.getCleanLayerName();
	var tokenList = layerName.split(SPLIT_TOKEN);
	for(var i = 1; i < tokenList.length; i++)
	{
        var token = tokenList[i].removeBlank().toLowerCase();
        if(token.startWith(PARAM_PREFIX))
        {
            var param = ParameterFactory.create(token.substring(1, token.length), this);
            this.paramList.push(param);
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
	var result = prefix + "{\n";
	result += prefix + TAB;
	result = this.addBaseProperty(result);
	result = this.addSpecifiedProperty(result);
	if(this.children.length == 0) result = result.substring(0, result.length - 2);//È¥µô¶ººÅ
	result += "\n";
	if(this.children.length > 0)
	{
		result += prefix + TAB + TAB + "\"Children\":\n";
		result += prefix + TAB + TAB + "[\n";
		var length = this.children.length;
		for(var i = 0; i < length; i++)
		{
			result += this.children[i].toJson(depth + 1);
			if(i != (length - 1))
			{
				result += ",";
			}
			result += "\n";
		}
		result += prefix + TAB + TAB + "]\n";
	}
	result += prefix + "}";
	return result;
}

BaseNode.prototype.addBaseProperty = function(content)
{
	content += this.getJsonFormatProperty("Name", this.name, false);
	content += this.getJsonFormatProperty("Type", this.type, false);
	content += this.getJsonFormatProperty("X", this.x, true);
	content += this.getJsonFormatProperty("Y", this.y, true);
	content += this.getJsonFormatProperty("Width", this.width, true);
	content += this.getJsonFormatProperty("Height", this.height, true);

    for (index in this.paramList)
    {
        var param = this.paramList[index];
        content += this.getJsonFormatProperty(param.getName(), param.getValue(), param.valueIsNumber());
    }

	//if(this.param != null)
	//{
	//	var paramStr = this.param.toLowerCase()
	//	var paramList = paramStr.split(" ");
	//	for(var i = 0; i < paramList.length; i++)
	//	{
	//		var param = paramList[i];
	//		if(param.startWith(PARAMETER_ATTACH)) content += this.getJsonFormatProperty("Attach", 1, true);
    //        else if(param.startWith(PARAMETER_HIDE)) content += this.getJsonFormatProperty("Hide", 1, true);
    //        else if(param.startWith(PARAMETER_MASK)) content += this.getJsonFormatProperty("Mask", 1, true);
	//	}
	//}
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

BaseNode.prototype.getCleanLayerName = function()
{
    var layerName = this.descriptor.getString(ST("name"));
	for(var i = 0;i < DUMMY_TOKEN_LIST.length;i++)
	{
		layerName = layerName.replace(DUMMY_TOKEN_LIST[i], String.empty);
	}
    return layerName;
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

BaseNode.prototype.getLinespacing = function()
{
    var linespacing = 1;
	if(this.param != null)
	{
		var paramStr = this.param.toLowerCase()
		var paramList = paramStr.split(" ");
		for(var i = 0; i < paramList.length; i++)
		{
			var param = paramList[i];
			if(param.startWith(PARAMETER_LINESPACING))
            {
                var lineSpacingStr = param.substring(PARAMETER_LINESPACING.length, param.length);
                linespacing = parseFloat(lineSpacingStr);
            }
        }
	}
    return linespacing;
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

BaseNode.prototype.setType = function(type)
{
    this.type = type.removeBlank().toLowerCase();
}

BaseNode.prototype.setBaseInfo = function(type, name)
{
    this.setType(type)
    this.setName(name)
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

BaseNode.prototype.isButton = function()
{
    if((this.type == TYPE_BUTTON) ||
        (this.type == TYPE_ENTER_EXIT_BUTTON) ||
        (this.type == TYPE_CUSTOM_BUTTON))
    {
        return true;
    }
    return false;
}
