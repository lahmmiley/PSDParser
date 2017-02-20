const TypeMap = 
{
    "image":1,
    "text":1,
    "container":1,
    "button":1,
	"toggle":1,
	"togglegroup":1,
	"scrollview":1,
	"list":1,
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
    //this.type = arguments[0];
    this.descriptor = arguments[0];
    this.parent = null;
    this.children = [];
    this.layerIndex = -1;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;

	//解析参数
	this.parseParam();

    this.toString = function()
    {
        return ("name:" + this.name + "  type:" + this.type + 
                    "  " + this.x + "  " + this.y + "  " + this.width + "  " + this.height);
    }
}

//不放在类内部是因为类初始化就会用到这个函数，需要把函数定义在调用之前
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

//文本图层返回的是实际像素的区域，比文本框范围略小
//游戏研发过程中需要更加具体使用的字体和字号在此基础上调整文本框范围值
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
    var hasType = TypeMap.hasOwnProperty(tokenList[0].toLowerCase());
    if(hasType)
    {
        return tokenList[0];
    }
    return "container";
}

BaseNode.prototype.getName = function(tokenList)
{
    var hasType = TypeMap.hasOwnProperty(tokenList[0].toLowerCase());
    if(hasType && tokenList.length > 1)
    {
        return tokenList[1];
    }
    return tokenList[0];
}

BaseNode.prototype.getPrefix = function(depth)
{
	var prefix = "";
	for(var i = 0; i < depth * 3; i++)
	{
		prefix += TAB;
	}
	return prefix;
}

BaseNode.prototype.toJson = function(depth, isFinalChild)
{
	var prefix = this.getPrefix(depth);
	var jsonStr = prefix + "{\n";
	jsonStr += prefix + TAB + "\"Name\":\"" + this.name + "\", \"Type\":\"" + this.type + 
						"\", \"X\":" + this.x + ", \"Y\":" + this.y +
						", \"Width\":" + this.width + ", \"Height\":" + this.height;
	if(this.children.length > 0) jsonStr += ",";
	jsonStr += "\n";
	if(this.children.length > 0)
	{
		jsonStr += prefix + TAB + TAB + "\"Children\":\n";
		jsonStr += prefix + TAB + TAB + "[\n";
		var length = this.children.length;
		for(var i = 0; i < length; i++)
		{
			jsonStr += this.children[i].toJson(depth + 1, (i == (length - 1)));
		}
		jsonStr += prefix + TAB + TAB + "]\n";
	}
	jsonStr += prefix + "}";
	if(!isFinalChild) jsonStr += ",";
	jsonStr += "\n";
	return jsonStr;
}
