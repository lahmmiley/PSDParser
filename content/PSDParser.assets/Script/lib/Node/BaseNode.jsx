const TYPE_IMAGE = "image";
const TYPE_TEXT = "text";
const TYPE_CONTAINER = "container";
const TYPE_BUTTON = "button";
const TYPE_TOGGLE = "toggle";
const TYPE_TOGGLEGROUP = "togglegroup";
const TYPE_SCROLLVIEW = "scrollview";
const TYPE_LIST = "list";

const TypeMap = 
{
    TYPE_IMAGE:1,
    TYPE_TEXT:1,
    TYPE_CONTAINER:1,
    TYPE_BUTTON:1,
	TYPE_TOGGLE:1,
	TYPE_TOGGLEGROUP:1,
	TYPE_SCROLLVIEW:1,
	TYPE_LIST:1,
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

String.empty = "";
String.prototype.repeat = function(n)
{
	return new Array(n + 1).join(this);
}

function BaseNode()
{
    this.descriptor = arguments[0];
    this.parent = null;
    this.children = [];
    this.layerIndex = -1;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;

	//解析参数
	this.parseLayerName();

    this.toString = function()
    {
        return ("name:" + this.name + "  type:" + this.type + 
                    "  " + this.x + "  " + this.y + "  " + this.width + "  " + this.height);
    }
}

//不放在类内部是因为类初始化就会用到这个函数，需要把函数定义在调用之前
BaseNode.prototype.parseLayerName = function()
{
    if(this.descriptor == null)
    {
        this.name = "root";
        this.type = TYPE_CONTAINER;
    }
    else
    {
		var layerName = this.descriptor.getString(ST("name"));
		for(var i = 0;i < DUMMY_TOKEN_LIST.length;i++)
		{
			layerName = layerName.replace(DUMMY_TOKEN_LIST[i], "");
		}
		this.setParam(layerName);
    }
}

BaseNode.prototype.setParam = function(layerName)
{
	var tokenList = layerName.split("_");
	this.type = this.getType();
	this.name = tokenList[0];
	if(tokenList.length == 2)
	{
		this.param = tokenList[1];
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

BaseNode.prototype.toJson = function(depth)
{
	var prefix = (TAB).repeat(depth * 3);
	var jsonStr = prefix + "{\n";
	jsonStr += prefix + TAB;
	jsonStr = this.addBaseProperty(jsonStr);
	jsonStr = this.addSpecifiedProperty(jsonStr);
	if(this.children.length == 0) jsonStr = jsonStr.substring(0, jsonStr.length - 2);//去掉逗号
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

BaseNode.prototype.addSpecifiedProperty = function(content)
{
	return content;
}

BaseNode.prototype.addBaseProperty = function(content)
{
	content += this.getJsonFormatProperty("Name", this.name, false);
	content += this.getJsonFormatProperty("Type", this.type, false);
	content += this.getJsonFormatProperty("X", this.x, true);
	content += this.getJsonFormatProperty("Y", this.y, true);
	content += this.getJsonFormatProperty("Width", this.width, true);
	content += this.getJsonFormatProperty("Height", this.height, true);
	return content;
}

BaseNode.prototype.getJsonFormatProperty = function(propertyName, propertyValue, isNumber)
{
	var result = "\"" + propertyName + "\":";
	if(isNumber)
	{
		result += propertyValue;
	}
	else
	{
		result += "\"" + propertyValue + "\"";
	}
	result +=  ", ";
	return result;
}
