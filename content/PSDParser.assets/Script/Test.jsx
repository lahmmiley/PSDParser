function BaseNode()
{
    this.descriptor = arguments[0];
    this.parent = arguments[1];
}

var b = new BaseNode();
alert(b.descriptor == null);
alert(b.parent == undefined);
