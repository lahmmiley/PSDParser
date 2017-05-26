function ParameterVerify()
{
    if(ParameterVerify.unique != undefined)
    {
    	return ParameterVerify.unique;
    }
    ParameterVerify.unique = this;
    this.errorMsg = String.empty;
}

ParameterVerify.prototype.appendErrorMsg = function(path, errorMsg)
{
    this.errorMsg += "路径:" + path + "\n" + errorMsg + "\n";
}

ParameterVerify.prototype.verifyChinese = function(node, layerName)
{
    if(layerName.containChinese())
    {
        var path = String.empty;
        if(node.parent != null)
        {
            path = node.parent.getFullPath() + "/";
        }
        path += layerName;
        this.appendErrorMsg(path, " 包含中文！");
    }
}

ParameterVerify.prototype.verify = function(node)
{
    this.traverseTree(node);
    if(this.errorMsg != String.empty)
    {
        alert(this.errorMsg);
        return false;
    }
    return true;
}

ParameterVerify.prototype.traverseTree = function(node)
{
    this.verifyNode(node);
    var children = node.children;
    for(var i = 0; i < children.length; i++)
    {
        var child = children[i];
        this.traverseTree(child);
    }
}

ParameterVerify.prototype.verifyNode = function(node)
{
    this.verifyName(node);
    this.verifyType(node);
    this.verifyParamType(node);
    var param = node.param;
    if(param != null)
	{
		var paramStr = param.toLowerCase()
		var paramList = paramStr.split(" ");
		for(var i = 0; i < paramList.length; i++)
		{
			var param = paramList[i];
			if(param.startWith(PARAMETER_SLICE)) this.verifySlice(node, param);
			if(param.startWith(PARAMETER_ALIGN)) this.verifyAlign(node, param);
			if(param.startWith(PARAMETER_SCALE)) this.verifyScale(node, param);
			if(param.startWith(PARAMETER_COLOR_TINT)) this.verifyColorTint(node, param);
			if(param.startWith(PARAMETER_LINESPACING)) this.verifyLinespacing(node, param);
			if(param.startWith(PARAMETER_CANVAS)) this.verifyCanvas(node, param);
		}
	}
}

ParameterVerify.prototype.verifyName = function(node)
{
    var name = node.name;
    if((name == undefined) || (name == String.empty))
    {
        this.appendErrorMsg(node.getFullPath(), "命名错误 name为空 是否忘记加分割线'|'");
    }
    else if(name.indexOf("@") != -1)
    {
        this.appendErrorMsg(node.getFullPath(), "命名错误 name:{0} 包含'@' 是否忘记加分割线'|'?".format(name));
    }
    else if(name.indexOf(',') != -1)
    {
        this.appendErrorMsg(node.getFullPath(), "命名错误 name:{0} 包含',' 是否忘记加分割线'|'?".format(name));
    }
    else if(name.indexOf('，') != -1)
    {
        this.appendErrorMsg(node.getFullPath(), "命名错误 name:{0} 包含'，' 请改为英文逗号','".format(name));
    }
}

ParameterVerify.prototype.verifyType = function(node)
{
    var typeStr = node.type;
    if(!TypeMap.hasOwnProperty(typeStr))
    {
        this.appendErrorMsg(node.getFullPath(), "类型错误 不存在类型type:{0}".format(typeStr));
    }
}

ParameterVerify.prototype.verifyParamType = function(node)
{
    var param = node.param;
    if(param != null)
	{
		var paramStr = param.toLowerCase()
		var paramList = paramStr.split(" ");
		for(var i = 0; i < paramList.length; i++)
		{
			var param = paramList[i];
            if((param.length != 0) && (!this.parameterExist(param)))
            {
                this.appendErrorMsg(node.getFullPath(), "不存在参数名:{0}".format(param));
            }
        }
    }
}

ParameterVerify.prototype.parameterExist = function(param)
{
    var exist = false;
    for(var key in ParameterMap)
    {
        if(param.startWith(key))
        {
            exist = true;
            break;
        }
    }
    return exist;
}

ParameterVerify.prototype.verifySlice = function(node, param)
{
    if(node.type != TYPE_IMAGE)
    {
        this.appendErrorMsg(node.getFullPath(), "slice参数错误 只能在image类型后面添加slice参数");
    }
    var sliceArray = param.substring(PARAMETER_SLICE.length, param.length).split(",");
    if(sliceArray.length != 4)
    {
        this.appendErrorMsg(node.getFullPath(), "slice参数错误 参数长度为:{0} 是否忘记加','（需要4个参数，分别表示上、右、下、左）".format(sliceArray.length));
        return;
    }
    var top = parseInt(sliceArray[0]);
    var right = parseInt(sliceArray[1]);
    var bottom = parseInt(sliceArray[2]);
    var left = parseInt(sliceArray[3]);
    if((top * bottom == 0) && ((top != 0) || (bottom != 0)))
    {
        this.appendErrorMsg(node.getFullPath(), "slice参数错误 top:{0} bottom:{1} 不支持top和bottom只有一个为0".format(top, bottom))
    }
    if((left * right ==0) && ((left != 0) || (right != 0)))
    {
        this.appendErrorMsg(node.getFullPath(), "slice参数错误 left:{0} right:{1} 不支持left和right只有一个为0".format(left, right))
    }
    if(node.height <= bottom + top)
    {
        this.appendErrorMsg(node.getFullPath(), "slice参数错误 top:{0} bottom:{1} width:{2} 图片高度小于九切片参数(top + bottom)".format(top, bottom, node.height))
    }
    if(node.width <= left + right)
    {
        this.appendErrorMsg(node.getFullPath(), "slice参数错误 left:{0} right:{1} width:{2} 图片宽度小于九切片参数(left + right)".format(left, right, node.width))
    }
}

ParameterVerify.prototype.verifyAlign = function(node, param)
{
    if(node.type != TYPE_TEXT)
    {
        this.appendErrorMsg(node.getFullPath(), "align参数错误 只能在text类型后面添加align参数");
    }
    var align = param.substring(PARAMETER_ALIGN.length, param.length);
    var exist = AlignMap.hasOwnProperty(align);
    if(!exist)
    {
        this.appendErrorMsg(node.getFullPath(), "align参数错误 不存在参数{0}".format(align));
    }
}

ParameterVerify.prototype.verifyScale = function(node, param)
{
    var scale = param.substring(PARAMETER_SCALE.length, param.length);
    if((node.type != TYPE_BUTTON) && (node.type != TYPE_ENTER_EXIT_BUTTON))
    {
        this.appendErrorMsg(node.getFullPath(), "scale参数错误 只能在button类型后面添加scale参数");
    }
    if(scale != String.empty && !this.isNumber(scale))
    {
        this.appendErrorMsg(node.getFullPath(), "scale参数错误 参数:{0} 不是数字".format(scale));
    }
}

ParameterVerify.prototype.verifyColorTint = function(node, param)
{
    if((node.type != TYPE_BUTTON) && (node.type != TYPE_ENTER_EXIT_BUTTON))
    {
        this.appendErrorMsg(node.getFullPath(), "colorTint参数错误 只能在button类型后面添加colorTint参数");
    }
}

ParameterVerify.prototype.verifyLinespacing = function(node, param)
{
    var lineSpacing = param.substring(PARAMETER_LINESPACING.length, param.length);
    if(node.type != TYPE_TEXT)
    {
        this.appendErrorMsg(node.getFullPath(), "lineSpacing参数错误 只能在text类型后面添加lineSpacing参数");
    }
    if(!this.isNumber(lineSpacing))
    {
        this.appendErrorMsg(node.getFullPath(), "lineSpacing参数错误 参数:{0} 不是数字".format(lineSpacing));
    }
}

ParameterVerify.prototype.verifyCanvas = function(node, param)
{
    var sortOrder = param.substring(PARAMETER_CANVAS.length, param.length);
    if(!this.isNumber(sortOrder))
    {
        this.appendErrorMsg(node.getFullPath(), "sortOrder参数错误 参数:{0} 不是数字".format(sortOrder));
    }
}

ParameterVerify.prototype.isNumber = function(str)
{
    var reg = /^[0-9]+.?[0-9]*$/;
    if(reg.test(str))
    {
        return true;
    }
    return false;
}
