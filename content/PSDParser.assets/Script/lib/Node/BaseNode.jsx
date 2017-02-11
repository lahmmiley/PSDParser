const typeMap = 
{
    "button":1,
    "image":1,
    "text":1,
    "container":1,
}

function inherit(p)
{
    function f() {};
    f.prototype = p;
    return new f();
}

function defineSubClass(superClass, constructor)
{
    constructor.prototype = inherit(superClass.prototype);
    constructor.prototype.constructor = constructor;
}

function BaseNode()
{
    this.type = arguments[0];
    this.descriptor = arguments[1];
    this.parent = null;
    this.children = [];
    this.layerIndex = -1;
    this.x = 0;
    this.y = 0;
    this.width = -1;
    this.height = -1;
    this.parseParam();

    this.toString = function()
    {
        return ("name:" + this.name + "  type:" + this.type + 
                    "  " + this.x + "  " + this.y + "  " + this.width + "  " + this.height);
    }
}

//���������ڲ�����Ϊ���ʼ���ͻ��õ������������Ҫ�Ѻ��������ڵ���֮ǰ
BaseNode.prototype.getLayerName = function()
{
    if(this.descriptor == null)
    {
        return "root";
    }
    return this.descriptor.getString(ST("name"));
}

BaseNode.prototype.parseParam = function()
{
    if(this.descriptor == null)
    {
        this.type = "container";
        this.name = "root";
    }
    else
    {
        var layerName = this.descriptor.getString(ST("name"));
        for(var i = 0;i < DUMMY_TOKEN_LIST.length;i++)
        {
            layerName = layerName.replace(DUMMY_TOKEN_LIST[i], "");
        }
        var tokenList = layerName.split("_");
        this.type = this.getType(tokenList);
        this.name = this.getName(tokenList);
    }
}

//�ı�ͼ�㷵�ص���ʵ�����ص����򣬱��ı���Χ��С
//��Ϸ�з���������Ҫ���Ӿ���ʹ�õ�������ֺ��ڴ˻����ϵ����ı���Χֵ
BaseNode.prototype.calculateBounds = function()
{
    //TODO
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

BaseNode.prototype.getType = function(tokenList)
{
    if(this.type == "image" || this.type == "text")
    {
        return this.type;
    }
    var hasType = typeMap.hasOwnProperty(tokenList[0].toLowerCase());
    if(hasType)
    {
        return tokenList[0];
    }
    return "container";
}

BaseNode.prototype.getName = function(tokenList)
{
    //TODO
    return tokenList[tokenList.length - 1];
    /*
    if(hasType)
    {
        return tokenList[1];
    }
    return tokenList[0];
    */
}

BaseNode.prototype.toJson = function(depth, haveNext)
{
	var prefix = "";
	for(var i = 0; i < depth * 2;i++)
	{
		prefix += TAB;
	}
	var jsonStr = prefix + "{\n";
	jsonStr += prefix + "\"Name\":\"" + this.name + "\", \"Type\":\"" + this.type + 
						"\", \"X\":" + this.x + ", \"Y\":" + this.y +
						", \"Width\":" + this.width + ", \"Height\":" + this.height + ",\n";
	if(this.children.length > 0)
	{
		jsonStr += prefix + TAB + "\"Children\":\n";
		jsonStr += prefix + TAB + "[\n";
		var length = this.children.length;
		for(var i = 0; i < length; i++)
		{
			jsonStr += this.children[i].toJson(depth + 1, (i != (length - 1)));
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