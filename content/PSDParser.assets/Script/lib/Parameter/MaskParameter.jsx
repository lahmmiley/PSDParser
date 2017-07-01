function MaskParameter()
{
    BaseParameter.apply(this, arguments);
}

defineSubClass(BaseParameter, MaskParameter);

MaskParameter.prototype.verify = function()
{
    var result = BaseParameter.prototype.verify.apply(this);
    var children = this.node.children;
    var haveImageAttach = false;
    for(var i = 0; i < children.length; i++)
    {
        var child = children[i];
        if((child.type == TYPE_IMAGE) && (child.haveAttachParam()))
        {
            haveImageAttach = true;
            break;
        }
    }

    if(!haveImageAttach)
    {
        result += this.generateErrorMsg("mask参数下面的子节点必须有带attach参数的image");
    }
    return result;
}
