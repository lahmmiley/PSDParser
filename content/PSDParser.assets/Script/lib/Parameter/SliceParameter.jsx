function SliceParameter()
{
    BaseParameter.apply(this, arguments);
}

defineSubClass(BaseParameter, SliceParameter);

SliceParameter.prototype.verify = function()
{
    var result = BaseParameter.prototype.verify.apply(this);
    var sliceArray = this.value.split(",");
    if(sliceArray.length != 4)
    {
        result += this.generateErrorMsg("参数长度为:{0} 是否忘记加','（需要4个参数，分别表示上、右、下、左）".format(sliceArray.length));
        return;
    }
    var top = parseInt(sliceArray[0]);
    var right = parseInt(sliceArray[1]);
    var bottom = parseInt(sliceArray[2]);
    var left = parseInt(sliceArray[3]);
    if((top * bottom == 0) && ((top != 0) || (bottom != 0)))
    {
        result += this.generateErrorMsg("top:{0} bottom:{1} 不支持top和bottom只有一个为0".format(top, bottom))
    }
    if((left * right ==0) && ((left != 0) || (right != 0)))
    {
        result += this.generateErrorMsg("left:{0} right:{1} 不支持left和right只有一个为0".format(left, right))
    }
    var node = this.node;
    if(node.height <= bottom + top)
    {
        result += this.generateErrorMsg("top:{0} bottom:{1} height:{2} 图片高度小于九切片参数(top + bottom)".format(top, bottom, node.height))
    }
    if(node.width <= left + right)
    {
        result += this.generateErrorMsg("left:{0} right:{1} width:{2} 图片宽度小于九切片参数(left + right)".format(left, right, node.width))
    }
    return result;
}
