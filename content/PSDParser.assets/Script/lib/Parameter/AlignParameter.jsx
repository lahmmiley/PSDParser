const AlignMap = new Object();
AlignMap.lowercenter = 1;
AlignMap.lowerleft = 1;
AlignMap.lowerright = 1;
AlignMap.middlecenter = 1;
AlignMap.middleleft = 1;
AlignMap.middleright = 1;
AlignMap.uppercenter = 1;
AlignMap.upperleft = 1;
AlignMap.upperright = 1;

function AlignParameter()
{
    BaseParameter.apply(this, arguments);
}

defineSubClass(BaseParameter, AlignParameter);

AlignParameter.prototype.verify = function()
{
    var result = BaseParameter.prototype.verify.apply(this);
    var exist = AlignMap.hasOwnProperty(this.value);
    if(!exist)
    {
        result += this.generateErrorMsg("不存在参数值{0}".format(this.value));
    }
    return result;

}
