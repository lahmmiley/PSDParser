function MirrorParameter()
{
    BaseParameter.apply(this, arguments);
}

defineSubClass(BaseParameter, MirrorParameter);

MirrorParameter.prototype.verify = function()
{
    var result = BaseParameter.prototype.verify.apply(this);
    if(this.node.getParamByType(PARAMETER_ATTACH) != null)
    {
        result += this.generateErrorMsg("不支持图片共用Mirror与Attach参数");
    }

    if(this.node.getParamByType(PARAMETER_SLICE) != null)
    {
        result += this.generateErrorMsg("不支持图片共用Mirror与Slice参数");
    }
    return result;
}
