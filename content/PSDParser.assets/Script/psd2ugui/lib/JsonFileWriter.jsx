function JsonFileWriter(environment)
{
    this.environment = environment;
}

JsonFileWriter.prototype.writeParseResult = function(data)
{
    var json = this.formatContainer(data, "");
    var jsonPath = this.environment.jsonFolderPath + "/" + this.environment.psdName + ".json";
    this.writeJsonFile(jsonPath, json);
}

JsonFileWriter.prototype.formatContainer = function(data, indent)
{
    var result = indent + "{";
    result += this.atomFormatPropertyList(data, ["name", "type", "param", "x", "y", "width", "height"], [1, 1, 1, 0, 0, 0, 0]) + ",";
    result += "\n";
    result += indent + "\t" + "\"children\":\n";
    result += this.formatContainerChildren(data, indent + "\t");
    result += indent + "}";
    return result;
}

JsonFileWriter.prototype.formatLanguage = function(data, indent)
{
    var result = indent + "{";
    result += this.atomFormatPropertyList(data, ["name", "type", "param"], [1, 1, 1]) + ",";
    result += "\n";
    result += indent + "\t" + "\"children\":\n";
    result += this.formatContainerChildren(data, indent + "\t");
    result += indent + "}";
    return result;
}

JsonFileWriter.prototype.formatContainerChildren = function(data, indent)
{
    var result = indent + "[" + "\n";
    var children = data.children;
    children.reverse();
    for(var i = 0;i < children.length;i++)
    {
        var child = children[i];
        if(child.type == "Image" || child.type == "ScaleImage")
        {
            result += this.formatImage(child, indent + "\t");
        }
        else if(child.type == "Label")
        {
            result += this.formatLabel(child, indent + "\t");
        }
        else if(child.type == "Language")
        {
            result += this.formatLanguage(child, indent + "\t");
        }
        else
        {
            result += this.formatContainer(child, indent + "\t");
        }

        if(i < (children.length - 1))
        {
            result += ",\n";
        }
    }
    result += "\n" + indent + "]\n";
    return result;
}

JsonFileWriter.prototype.formatImage = function(data, indent)
{
    var result = indent + "{";
    result += this.atomFormatPropertyList(data, ["name", "type", "param", "x", "y", "width", "height"], [1, 1, 1, 0, 0, 0, 0]) + ",";
    for(var state in data)
    {
        if(data[state] instanceof Object)
        {
            if(data[state].link != undefined)
            {
                result += "\n" + indent + "\t" + "\"" + state + "\"" + ":" + this.formatImageState(data[state]) + ",";
            }
        }
    }
    result = result.substring(0, result.length - 1);
    result += "\n" + indent + "}";
    return result;
}

JsonFileWriter.prototype.formatImageState = function(data)
{
    var result = "{" + this.atomFormatPropertyList(data, 
        ["link", "x", "y", "width", "height", "alpha", "mirror", "top", "right", "bottom", "left", "clamp"],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    if(data.solidFill != undefined)
    {
        result += ",\"solidFill\":{" + this.atomFormatPropertyList(data.solidFill, ["mode", "color"], [1, 1]) + "}";
    }
    result += "}";
    return result;
}

JsonFileWriter.prototype.formatLabel = function(data, indent)
{
    var result = indent + "{";
    result += this.atomFormatPropertyList(data, ["name", "type", "x", "y", "width", "height"], [1, 1, 0, 0, 0, 0]) + ",";
    for(var state in data)
    {
        if(data[state] instanceof Object)
        {
            if(data[state].format != undefined)
            {
                result += "\n" + indent + "\t" + "\"" + state + "\"" + ":" + this.formatLabelState(data[state]) + ",";
            }
        }
    }
    result = result.substring(0, result.length - 1);
    result += "\n" + indent + "}";
    return result;
}

JsonFileWriter.prototype.formatLabelState = function(data)
{
    var result = "{";
    result += this.atomFormatPropertyList(data, 
        ["x", "y", "width", "height", "content", "param", "alignment", "lineSpacing", "langId"],
        [0, 0, 0, 0, 1, 1, 1, 1, 0]) + ",";
    if(data.stroke != undefined)
    {
        result += "\"stroke\":{";
        result += this.atomFormatPropertyList(data.stroke, ["distance", "color"], [0, 1]);
        result += "},";
    }
    if(data.shadow != undefined)
    {
        result += "\"shadow\":{";
        result += this.atomFormatPropertyList(data.shadow, ["distance", "angle", "color"], [0, 0, 1]);
        result += "},";
    }
    result += "\"format\":{";
    result += this.atomFormatPropertyList(data.format, ["color", "font", "size"], [1, 1, 0]);
    result += "}}";
    return result;
}

JsonFileWriter.prototype.writeExtractResult = function(data)
{
    var json = this.formatFolderNode(data, "");
    var jsonPath = this.environment.jsonFolderPath + "/" + this.environment.psdName + "_extract.json";
    this.writeJsonFile(jsonPath, json);
}

JsonFileWriter.prototype.formatFolderNode = function(data, indent)
{
    var result = indent + "{";
    result += this.atomFormatPropertyList(data, ["name", "type", "visible"], [1, 1, 0]) + ",";
    result += "\n";
    result += indent + "\t" + "\"children\":\n";
    result += this.formatChildrenNode(data.children, indent + "\t");
    result += indent + "}";
    return result;
}

JsonFileWriter.prototype.formatChildrenNode = function(children, indent)
{
    var result = indent + "[" + "\n";
    for(var i = 0;i < children.length;i++)
    {
        var child = children[i];
        if(child.type == "folder")
        {
            result += this.formatFolderNode(child, indent + "\t");
        }
        else if(child.type == "text")
        {
            result += this.formatTextNode(child, indent + "\t");
        }
        else
        {
            result += this.formatImageNode(child, indent + "\t");
        }
        if(i < (children.length - 1))
        {
            result += ",\n";
        }
    }
    result += "\n" + indent + "]\n";
    return result;
}

JsonFileWriter.prototype.formatImageNode = function(data, indent)
{
    var result = indent + "{";
    result += this.atomFormatPropertyList(data, ["name", "type", "visible", "x", "y", "width", "height"],
        [1, 1, 0, 0, 0, 0, 0]) + ",";
    for(var i = 0;i < data.effects.length;i++)
    {
        result += this.formatImageEffects(data.effects);
    }
    if(data.effects.length == 0)
    {
        result = result.substring(0, result.length - 1);
    }
    result += "}";
    return result;
}

JsonFileWriter.prototype.formatImageEffects = function(effects)
{
    var result = "\"effects\":[";
    for(var i = 0; i < effects.length;i++)
    {
        result += "{" + this.atomFormatPropertyList(effects[i], ["type", "mode", "r", "g", "b", "alpha"],
                        [1, 1, 0, 0, 0, 0]) + "}" + ",";
    }
    result = result.substring(0, result.length - 1);
    result += "]";
    return result;
}

JsonFileWriter.prototype.formatTextNode = function(data, indent)
{
    var result = indent + "{";
    result += this.atomFormatPropertyList(data, ["name", "type", "visible", "x", "y", "width", "height"],
                        [1, 1, 0, 0, 0, 0, 0]);
    result += "}";
    return result;
}

JsonFileWriter.prototype.writeJsonFile = function(path, content)
{
    var file = new File(path);
    file.encoding = "UTF8";
    if(file.open("w") == true)
    {
        file.write(content);
        file.close();
    }
}

//0为数字， 1为字符串
JsonFileWriter.prototype.atomFormatPropertyList = function(obj, propertyList, typeList)
{
    if(propertyList.length != typeList.length)
    {
        throw new Error("属性长度和属性类型长度不符~~~");
    }
    var result = "";
    var len = propertyList.length;
    for(var i = 0; i < len;i++)
    {
        if(obj[propertyList[i]] == undefined)
        {
            continue;
        }
        result += this.atomFormatProperty(obj, propertyList[i], typeList[i]);
        result += ",";
    }
    //去掉最后一个","号
    result = result.substring(0, result.length - 1);
    return result;
}

//字符串需要加双引号
//需要手动配置吗？
JsonFileWriter.prototype.atomFormatProperty = function(obj, property, type)
{
    if(type == 0)
    {
        return "\"" + property + "\"" + ":" + obj[property];
    }
    return "\"" + property + "\"" + ":" + "\"" + obj[property] + "\"";
}
