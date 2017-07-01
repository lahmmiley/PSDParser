const DirectionMap = new Object();
DirectionMap.horizontal = 1;
DirectionMap.vertical = 1;

function DirectionParameter()
{
    BaseParameter.apply(this, arguments);
}

defineSubClass(BaseParameter, DirectionParameter);

DirectionParameter.prototype.verify = function()
{
    var result = BaseParameter.prototype.verify.apply(this);
    var exist = DirectionMap.hasOwnProperty(this.value);
    if(!exist)
    {
        result += this.generateErrorMsg("不存在参数值{0}".format(this.value));
    }
    return result;
}
