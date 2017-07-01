function VerifyManager()
{
    if(VerifyManager.unique != undefined)
    {
    	return VerifyManager.unique;
    }
    VerifyManager.unique = this;
    this.errorMsg = String.empty;
}

VerifyManager.prototype.appendErrorMsg = function(path, errorMsg)
{
    this.errorMsg += "路径:" + path + "\n" + errorMsg + "\n";
}

VerifyManager.prototype.verifyChinese = function(node, layerName)
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

VerifyManager.prototype.verify = function(node)
{
    this.traverseTree(node);
    if(this.errorMsg != String.empty)
    {
        alert(this.errorMsg);
        return false;
    }
    return true;
}

VerifyManager.prototype.traverseTree = function(node)
{
    this.verifyNode(node);
    var children = node.children;
    for(var i = 0; i < children.length; i++)
    {
        var child = children[i];
        this.traverseTree(child);
    }
}

VerifyManager.prototype.verifyNode = function(node)
{
    this.verifyName(node);
    this.verifyType(node);
    for(index in node.paramList)
    {
        var param = node.paramList[index];
        var result = param.verify();
        if(result != String.empty)
        {
            this.errorMsg += result;
        }
    }
}

VerifyManager.prototype.verifyName = function(node)
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

VerifyManager.prototype.verifyType = function(node)
{
    var typeStr = node.type;
    if(!TypeMap.hasOwnProperty(typeStr))
    {
        this.appendErrorMsg(node.getFullPath(), "类型错误 不存在类型type:{0}".format(typeStr));
    }

    if(typeStr == TYPE_SCROLL_RECT)
    {
        this.verifyScrollRectType(node)
    }
}

VerifyManager.prototype.verifyScrollRectType = function(node)
{
    var children = node.children;
    var haveContainer = false
    for(var i = 0; i < children.length; i++)
    {
        var child = children[i];
        if(child.name == "Container")
        {
            haveContainer = true;
            break;
        }
    }

    if(!haveContainer)
    {
        this.appendErrorMsg(node.getFullPath(), "ScrollRect类型错误 ScrollRect类型必须有名为Container的子节点");
    }
}
