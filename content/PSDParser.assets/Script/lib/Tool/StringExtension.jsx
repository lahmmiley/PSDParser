String.empty = "";
String.prototype.repeat = function(n)
{
	return new Array(n + 1).join(this);
}

String.prototype.startWith = function(str)
{     
  var reg = new RegExp("^" + str);     
  return reg.test(this);
}

String.prototype.endWith = function(str)
{     
  var reg = new RegExp(str + "$");     
  return reg.test(this);
}

String.prototype.containChinese = function()
{
  var reg = new RegExp(/[\u4E00-\u9FA5\uF900-\uFA2D]/);     
  return reg.test(this);
}

String.prototype.format = function(args) {  
	var result = this;  
	if (arguments.length > 0)
	{
	    for (var i = 0; i < arguments.length; i++)
	    {
	        if (arguments[i] != undefined)
	        {
                var reg = new RegExp("\\{" + i + "\\}", "g");
	        	result = result.replace(reg, arguments[i]);
	        }
	    }
	}
	return result;
}

String.prototype.trim = function()
{
    return this.replace(/(^\s*)|(\s*$)/g, String.empty);
}

String.prototype.removeBlank = function()
{
    return this.replace(/\s/g, String.empty);
}
