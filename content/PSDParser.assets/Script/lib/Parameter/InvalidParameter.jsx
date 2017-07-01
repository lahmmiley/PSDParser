function InvalidParameter()
{
    BaseParameter.apply(this, arguments);
}

defineSubClass(BaseParameter, InvalidParameter);

InvalidParameter.prototype.parseContent = function() {}

InvalidParameter.prototype.verify = function()
{
    return "路径:{0}\n不存在参数名 {1}\n".format(this.node.getFullPath(), this.content);
}
