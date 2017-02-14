function ContainerNode()
{
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, ContainerNode);

ContainerNode.prototype.calculateBounds = function()
{
    var left = Number.MAX_VALUE;
    var top = Number.MAX_VALUE;
    var right = Number.MIN_VALUE;
    var bottom = Number.MIN_VALUE;
    for(var i = 0; i < this.children.length;i++)
    {
        var child = this.children[i];
        left = (left > child.x) ? child.x : left;
        top = (top > child.y) ? child.y : top;
        right = (right < (child.width + child.x)) ? (child.width + child.x) : right
        bottom = (bottom < (child.height + child.y)) ? (child.height + child.y) : bottom;
    }
    this.x = left;
    this.y = top;
    this.width = right - left;
    this.height = bottom - top;
}
