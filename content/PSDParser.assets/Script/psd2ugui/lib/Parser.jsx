//资源名称命名验证正则表达式，1.不允许数字和特殊符号作为命名开始， 2.图像图层命名中不能包含中文字符
const FIRST_TOKEN_REGEXP = /^([0-9]|\~|\!|\@|\#|\^|\*)/;
const CHINESE_CHAR_REGEXP = /[\u4e00-\u9fa5]/;
//消除图层命名中的无意义字符
const DUMMY_TOKEN_LIST = [/\#/g, /\./g, / /g, /副本\d*/g, /拷贝\d*/g, /copy\d*/g];
const SHARED = "Shared";
const SCALE_9_GRID_REGEXP = /(_|\|)\d+,\d+,\d+,\d+/g;
const REMAIN_MIRROR_REGEXP = /(_|\|)((left)|(up))/ig;
const DISCARD_MIRROR_REGEXP = /(_|\|)((right)|(down))/ig;
const STATIC_REGEXP = /(_|\|)(static)/ig;
const BRACE_REGEXP = /\{[\s\S]*?\}/gm;
const PLACEHOLDER = "placeholder";
const NOT_EXPORT =  "notexport";
const LABEL_DEFAULT_ALIGNMENT = "UpperLeft";
const LABEL_DEFAULT_LINE_SPACING = "1.0";
const LABEL_REGEXP = /(_|\|)(Upper|Middle|Lower)(Left|Center|Right)(,\d{1, 2}(\.\d{1,3}))?/ig;
const LANG_ID_REGEXP = /(_|\|)(lang)\d+/ig;
const ALLOW_FONT = [/MicrosoftYaHei/];

//使用正则表达式对组件名称进行验证，$表示名称结尾
const TOGGLE_REGEXP =           {required:[".*_checkmark"]};
const TOGGLE_GROUP_REGEXP =     {required:["Toggle_.*"]};
const LIST_REGEXP =             {required:[".*_item"]};
const TREE_REGEXP =             {required:[".*_menu", ".*_detail"]};
const SLIDER_REGEXP =           {required:[".*_fill$"], optional:[".*_handle$"]};
const PROGRESS_BAR_REGEXP =     {required:["(Image|ScaleImage)_bar"]};
const INPUT_REGEXP =            {required:["Label_.*"]};
const SCROLL_VIEW_REGEXP =      {required:["ScaleImage_mask$"]};
const SCROLL_PAGE_REGEXP =      {required:["ScaleImage_mask$"]};

function Parser(environment)
{
    this.environment = environment;
    this.isExportMirror = false;
    this.sharedAssetMap = {};
    this.assetMap = {};

    this.typeSet =
    {
        "Image":
        {
            "parser" : "parseImage",
            "validator" : "validateImage",
            "childrenRegExp" : null
        },
        "ScaleImage":
        {
            "parser" : "parseImage",
            "validator" : "validateImage",
            "childrenRegExp" : null
        },
        "Label":
        {
            "parser" : "parseLabel",
            "validator" : "validateLabel",
            "childrenRegExp" : null
        },
        "Input":
        {
            "parser" : "parseContainer",
            "validator" : "validateContainer",
            "childrenRegExp" : INPUT_REGEXP
        },
        "ProgressBar":
        {
            "parser" : "parseContainer",
            "validator" : "validateContainer",
            "childrenRegExp" : PROGRESS_BAR_REGEXP 
        },
        "Button":
        {
            "parser" : "parseContainer",
            "validator" : "validateContainer",
            "childrenRegExp" : null
        },
        "Container":
        {
            "parser" : "parseContainer",
            "validator" : "validateContainer",
            "childrenRegExp" : null
        },    
        "List":
        {
            "parser" : "parseContainer",
            "validator" : "validateContainer",
            "childrenRegExp" : LIST_REGEXP
        },
        "Tree":
        {
            "parser" : "parseContainer",
            "validator" : "validateContainer",
            "childrenRegExp" : TREE_REGEXP
        },
        "Toggle":
        {
            "parser" : "parseContainer",
            "validator" : "validateContainer",
            "childrenRegExp" : TOGGLE_REGEXP
        },
        "ToggleGroup":
        {
            "parser" : "parseContainer",
            "validator" : "validateContainer",
            "childrenRegExp" : TOGGLE_GROUP_REGEXP
        },
        "Slider":
        {
            "parser" : "parseContainer",
            "validator" : "validateContainer",
            "childrenRegExp" : SLIDER_REGEXP
        },
        "ScrollView":
        {
            "parser" : "parseContainer",
            "validator" : "validateContainer",
            "childrenRegExp" : SCROLL_VIEW_REGEXP
        },
        "ScrollPage":
        {
            "parser" : "parseContainer",
            "validator" : "validateContainer",
            "childrenRegExp" : SCROLL_PAGE_REGEXP
        },
        "Language":
        {
            "parser" : "parseLanguage",
            "validator" : "validateContainer",
            "childrenRegExp" : null
        }
    }
}

Parser.prototype.loadSharedAssetXml = function()
{
    var xmlPath = this.environment.xmlFolderPath + "/Shared.xml";
    var file = new File(xmlPath);
    if(file.exists == true)
    {
        var assetNameRegExp = /[^\\]+?(?=\.png)/gm;
        if(file.open("r") == true)
        {
            var content = file.read();
            file.close();
            var matchList = content.match(assetNameRegExp);
            for(var i = 0; i < matchList.length;i++)
            {
                this.sharedAssetMap[matchList[i]] = 1;
            }
        }
    }
}

Parser.prototype.parse = function(extractData)
{
    var result = this.parseTopContainer(extractData);
    this.validateContainer(result, "");
    return result;
}

Parser.prototype.parseTopContainer = function(extractData)
{
    var result = {};
    result.name = this.environment.psdName;
    result.type = "Container";
    result.x = 0;
    result.y = 0;
    result.width = this.environment.doc.width.value;
    result.height = this.environment.doc.height.value;
    result.children = this.parseLayerList(extractData.children, "", "");
    result.children = this.removePlaceholder(result.children);
    return result;
}

//parentPath是保存图层父级路径，提供更精确的错误定位
Parser.prototype.parseContainer = function(layer, parentPath, language)
{
    var result = this.getGroupLayerIdentifier(layer);
    var currentPath = parentPath + "/" + layer.name;
    var children = this.parseLayerList(layer.children, currentPath, language);
    var bounds = this.calculateContainerBounds(children);
    this.adjustContainerBounds(result, bounds);
    this.adjustChildrenBounds(children, result);
    children = this.removePlaceholder(children);
    result.children = children;
    return result;
}

Parser.prototype.parseLanguage = function(layer, parentPath, language)
{
    var result = this.getGroupLayerIdentifier(layer);
    var currentPath = parentPath + "/" + layer.name;
    var children = this.parseLayerList(layer.children, currentPath, result.name);
    var bounds = this.calculateContainerBounds(children);
    this.adjustContainerBounds(result, bounds);
    this.adjustChildrenBounds(children, result);
    children = this.removePlaceholder(children);
    result.children = children;
    return result;
}

Parser.prototype.removePlaceholder = function(children)
{
    var result = new Array();
    var len = children.length;
    for(var i = 0;i < len;i++)
    {
        var obj = children[i];
        if(obj.name != PLACEHOLDER)
        {
            result[result.length] = obj;
        }
    }
    return result;
}

Parser.prototype.parseLabel = function(layer, parentPath, language)
{
    var result = this.getGroupLayerIdentifier(layer);
    var currentPath = parentPath + "/" + layer.name;
    return this.parseStateGroupLayer(layer, result, "Label", "atomParseTextLayer", currentPath, language);
}

Parser.prototype.parseImage = function(layer, parentPath, language)
{
    var result = this.getGroupLayerIdentifier(layer);
    var currentPath = parentPath + "/" + layer.name;
    return this.parseStateGroupLayer(layer, result, "Image", "atomParseImageLayer", currentPath, language);
}

Parser.prototype.parseStateGroupLayer = function(layer, preprocessResult, typeName, atomParser, path, language)
{
    var result = preprocessResult;
    if(layer.children.length == 0)
    {
        this.logError(path + "\n" + typeName + "【" + result.name + "】格式错误！文件夹内容为空。");
        return result;
    }
    var children = new Array();
    for(var i = 0;i < layer.children.length;i++)
    {
        var child = layer.children[i];
        var childName = this.eliminateDummyTokenOfLayerName(child);
        var currentPath = path + "/" + child.name;
        if(child.type != "folder")
        {
            this.logError(currentPath + "\n" + typeName + "【" + result.name + "】格式错误！文件夹内容包含非状态文件夹内容！");
            return result;
        }
        if(child.children.length == 0)
        {
            this.logError(currentPath + "\n" + typeName + "【" + result.name + "】格式错误！文件夹内容包为空！");
            return result;
        }
        if(child.children.length > 1)
        {
            this.logError(currentPath + "\n" + typeName + "【" + result.name + "】格式错误！状态文件夹内容长度大于1！");
            return result;
        }
        result[childName] = this[atomParser](child.children[0], currentPath, language);
        children.push(result[childName]);
     }
     var bounds = this.calculateContainerBounds(children);
     this.adjustContainerBounds(result, bounds);
     this.adjustChildrenBounds(children, result);
     return result;
}

Parser.prototype.parseLayerList = function(layerList, parentPath, language)
{
    var result = new Array();
    var len = layerList.length;
    for(var i = len - 1;i >= 0;i--)
    {
        var obj;
        var layer = layerList[i];

        var isNotExport = (layer.name.toLowerCase() == NOT_EXPORT);
        if(isNotExport == true)
        {
            continue;
        }
        if(layer.visible == 0)
        {
            continue;
        }
        if(layer.type == "folder")
        {
            obj = this.parseGroupLayer(layer, parentPath, language);
        }
        else if(layer.type == "text")
        {
            obj = this.parseTextLayer(layer, parentPath, language);
        }
        else
        {
            obj = this.parseImageLayer(layer, parentPath, language);
        }
        if(obj != null)
        {
            result.push(obj);
        }
    }
    return result;
}

Parser.prototype.parseGroupLayer = function(layer, parentPath, language)
{
    var parser = this.getGroupLayerParser(layer);
    if(parser == null)
    {
        this.logError(parentPath + "\n" + layer.name + "【" + this.getGroupLayerIdentifier(layer).type + "】" + "未找到对应解析函数");
    }
    return this[parser](layer, parentPath, language);
}

Parser.prototype.getGroupLayerParser = function(layer)
{
    var obj = this.getGroupLayerIdentifier(layer);
    var typeObj = this.typeSet[obj.type];
    if(typeObj != null)
    {
        return typeObj.parser;
    }
    return null;
}

Parser.prototype.getGroupLayerIdentifier = function(layer)
{
    var str = this.eliminateDummyTokenOfLayerName(layer);
    var obj = new Object();
    var paramList = str.split("_");
    obj.name = this.extractLayerName(paramList);
    obj.type = this.extractLayerType(paramList);
    obj.param = this.extractLayerParam(paramList);
    return obj;
}

Parser.prototype.eliminateDummyTokenOfLayerName = function(layer)
{
    var name = layer.name;
    var len = DUMMY_TOKEN_LIST.length;
    for(var i = 0;i < len;i++)
    {
        name = name.replace(DUMMY_TOKEN_LIST[i], "");
    }
    return name;
}

Parser.prototype.extractLayerType = function(paramList)
{
    var type = paramList[0];
    if(this.typeSet[type] != null)
    {
        return type;
    }
    return "Container";
}

Parser.prototype.extractLayerName = function(paramList)
{
    if(paramList[1] == undefined)
    {
        return paramList[0];
    }
    return paramList[1];
}

Parser.prototype.extractLayerParam = function(paramList)
{
    return paramList[2];
}

Parser.prototype.getLayerParamToken = function(rawName, pattern)
{
    var result = rawName.match(pattern)[0];
    result = result.substring(1);
    return result;
}

//解析图像图层
Parser.prototype.parseImageLayer = function(layer, parentPath, language)
{
    var result = this.parseImageLayerName(layer, language);
    result.normal = this.atomParseImageLayer(layer, parentPath, language);
    var bounds = this.unionRectangle([result.normal]);
    this.adjustContainerBounds(result, bounds);
    result.normal.x = result.normal.x - result.x;
    result.normal.y = result.normal.y - result.y;
    return result;
}

Parser.prototype.parseImageLayerName = function(layer, language)
{
    var raw = this.eliminateDummyTokenOfLayerName(layer);
    var assetName = null;
    var name = null;
    var param = null;
    var top = null;
    var right = null;
    var bottom = null;
    var left = null;
    var mirror = null;
    var type = "Image";
    name = raw.split("_")[0];
    assetName = name;

    if(raw.match(STATIC_REGEXP) != null)
    {
        param = "static";
    }
    if(raw.match(SCALE_9_GRID_REGEXP) != null)
    {
        var paramToken = this.getLayerParamToken(raw, SCALE_9_GRID_REGEXP);
        var paramList = paramToken.split(",");
        top = paramList[0];
        right = paramList[1];
        bottom = paramList[2];
        left = paramList[3];
        if(top == 0)
        {
            top = Math.floor(layer.height / 2);
            bottom = layer.height - 1 - top;
        }
        if(left == 0)
        {
            left = Math.floor(layer.width / 2);
            right = layer.width - 1 - left;
        }
        type = "ScaleImage";
    }
    if(raw.match(REMAIN_MIRROR_REGEXP) != null)
    {
        var paramToken = this.getLayerParamToken(raw, REMAIN_MIRROR_REGEXP);
        name = name + "_" + paramToken;
        mirror = paramToken;
        assetName = name;
    }
    else if(raw.match(DISCARD_MIRROR_REGEXP) != null)
    {
        var paramToken = this.getLayerParamToken(raw, DISCARD_MIRROR_REGEXP);
        name = name + "_" + paramToken;
        assetName = this.getDiscardAssetName(raw);
        mirror = this.getDiscardMirror(raw);
    }
    if(language != "" && this.sharedAssetMap[assetName] == null)
    {
        assetName = language + "#" + assetName;
    }
    return {name:name, type:type, param:param, assetName:assetName, mirror:mirror, top:top, right:right, bottom:bottom, left:left};
}

Parser.prototype.getDiscardAssetName = function(rawName)
{
    var name = rawName.split("_")[0];
    var paramToken = this.getLayerParamToken(rawName, DISCARD_MIRROR_REGEXP);
    if(this.isExportMirror == true)
    {
        return name + "_" + paramToken;
    }
    if(paramToken == "down")
    {
        return name + "_up";
    }
    return name + "_left";
}

Parser.prototype.getDiscardMirror = function(rawName)
{
    var paramToken = this.getLayerParamToken(rawName, DISCARD_MIRROR_REGEXP);
    if(this.isExportMirror == true)
    {
        return (paramToken == "down") ? "up" : "left";
    }
    return paramToken;
}

Parser.prototype.atomParseImageLayer = function(layer, parentPath, language)
{
    var result = this.parseImageLayerName(layer, language);
    var assetName = result.assetName;
    var prefix = this.environment.psdName;
    if(this.sharedAssetMap[assetName] != null)
    {
        prefix = SHARED;
    }
    if(assetName != PLACEHOLDER)
    {
        this.assetMap[assetName] = prefix + "\\" + assetName;
    }
    result.link = prefix + "." + assetName;
    result.x = layer.x;
    result.y = layer.y;
    result.width = layer.width;
    result.height = layer.height;
    result.alpha = Math.floor(layer.alpha * 100);
    result.solidFill = this.getImageSolidFillEffect(layer);
    layer.assetName = result.link;
    return result;
}

Parser.prototype.getImageSolidFillEffect = function(layer)
{
    if(layer.effects != null && layer.effects.length > 0)
    {
        var solidFillObj = layer.effects[0];
        var result = {};
        result.mode = solidFillObj.mode;
        result.color = Math.floor(solidFillObj.r) + "," + solidFillObj.g + "," + solidFillObj.b + "," + solidFillObj.alpha;
        return result;
    }
    return null;
}

//解析文本图层
Parser.prototype.parseTextLayer = function(layer, parentPath, language)
{
    var result = this.parseTextLayerName(layer, language);
    result.normal = this.atomParseTextLayer(layer, parentPath, language);
    var bounds = this.unionRectangle([result.normal]);
    this.adjustContainerBounds(result, bounds);
    result.normal.x = result.normal.x - result.x;
    result.normal.y = result.normal.y - result.y;
    return result;
}

Parser.prototype.parseTextLayerName = function(layer, language)
{
    var raw = this.eliminateDummyTokenOfLayerName(layer);
    var paramToken = null;
    var unicode = null;
    var param = null;
    var alignment = LABEL_DEFAULT_ALIGNMENT;
    var lineSpacing = LABEL_DEFAULT_LINE_SPACING;
    var langId = null;
    if(raw.match(STATIC_REGEXP) != null)
    {
        param = this.getLayerParamToken(raw, STATIC_REGEXP);
    }
    if(raw.match(LANG_ID_REGEXP) != null)
    {
        langId = this.getLayerParamToken(raw, LANG_ID_REGEXP);
        langId = langId.substring(4);
    }
    if(raw.match(LABEL_REGEXP) != null)
    {
        var name = raw.split("_")[0];
        paramToken = this.getLayerParamToken(raw, LABEL_REGEXP);
        var paramList = paramToken.split(",");
        alignment = paramList[0];
        if(paramList.length == 2)
        {
            lineSpacing = paramList[1];
        }
    }
    return {name:raw.split("_")[0], type:"Label", param:param, langId:langId, alignment:alignment, lineSpacing:lineSpacing};
}

Parser.prototype.atomParseTextLayer = function(layer, parentPath, language)
{
    if(layer.fragments.length == 0)
    {
        this.logError(parentPath + "/" + layer.name + "文本为空！");
    }
    var result = this.parseTextLayerName(layer, language);
    result.content = "";
    result.format = this.parseTextDefaultTextFormat(layer.fragments[0]);
    if(this.isFontAllowed(result.format.font) == false)
    {
        this.logError(parentPath + "\n" + "【" + layer.name + "】" + result.format.font + " 字体不允许使用!!" );
    }
    for(var i = 0; i < layer.fragments.length;i++)
    {
        var fragment = layer.fragments[i];
        if(i > 0)
        {
            result.content += "<color=#" + fragment.color + ">" + fragment.text + "</color>";
        }
        else
        {
            result.content += fragment.text;
        }
    }
    result.content = this.replaceBrace(result.content);
    result.content = result.content.replace("/\r/ig", "\\n");
    result.x = layer.x;
    result.y = layer.y;
    result.width = layer.width;
    result.height = layer.height;
    result.stroke = this.getTextStrokeEffect(layer);
    result.shadow = this.getTextShadowEffect(layer);
    return result;
}

Parser.prototype.isFontAllowed = function(font)
{
    for(var i = 0; i < ALLOW_FONT.length;i++)
    {
        if(font.match(ALLOW_FONT[i]) != null)
        {
            return true;
        }
    }
    return false;
}

Parser.prototype.replaceBrace = function(content)
{
    var result = content.match(BRACE_REGEXP);
    if(result != null)
    {
        for(var i = 0; i < result.length;i++)
        {
            content = content.replace(result[i], "{" + i + "}");
        }
    }
    return content;
}

Parser.prototype.parseTextDefaultTextFormat = function(fragment)
{
    var result = {};
    result.font = fragment.font;
    result.size = fragment.size;
    result.color = "0x" + fragment.color;
    return result;
}

Parser.prototype.getTextStrokeEffect = function(layer)
{
    if(layer.effects.length == 0)
    {
        return null;
    }
    for(var i = 0;i < layer.effects.length;i++)
    {
        var effect = layer.effects[i];
        if(effect.type == "stroke")
        {
            var result = {name : "stroke"};
            result.distance = effect.size;
            result.color = effect.r + "," + effect.g + "," + effect.b + "," + effect.alpha;
            return result;
        }
    }
    return null;
}

Parser.prototype.getTextShadowEffect = function(layer)
{
    if(layer.effects.length == 0)
    {
        return null;
    }
    for(var i = 0;i < layer.effects.length;i++)
    {
        var effect = layer.effects[i];
        if(effect.type == "dropShadow")
        {
            var result = {name : "shadow"};
            result.angle = effect.angle;
            result.distance = effect.distance;
            result.color = effect.r + "," + effect.g + "," + effect.b + "," + effect.alpha;
            return result;
        }
    }
    return null;
}

//重新计算组件相对坐标和尺寸
Parser.prototype.calculateContainerBounds = function(children)
{
    var rectList = new Array();
    var len = children.length;
    for(var i = 0; i < len; i++)
    {
        if(this.isEmptyChild(children[i]) == false)
        {
            rectList.push(children[i]);
        }
    }
    return this.unionRectangle(rectList);
}

Parser.prototype.unionRectangle = function(rectList)
{
    if(rectList.length == 0)
    {
        return {x:0, y:0, width:0, height:0};
    }
    var result = new Object();
    var left = Number.MAX_VALUE;
    var top = Number.MAX_VALUE;
    var right = Number.MIN_VALUE;
    var bottom = Number.MIN_VALUE;
    var len = rectList.length;
    for(var i = 0; i < len;i++)
    {
        var rect = rectList[i];
        if(left > rect.x)
        {
            left = rect.x;
        }
        if(top > rect.y)
        {
            top = rect.y;
        }
        if(right < (rect.width + rect.x))
        {
            right = rect.width + rect.x;
        }
        if(bottom < (rect.height + rect.y))
        {
            bottom = rect.height + rect.y;
        }
    }
    result.x = left;
    result.y = top;
    result.width = right - left;
    result.height = bottom - top;
    return result;
}

Parser.prototype.adjustContainerBounds = function(obj, bounds)
{
    obj.x = bounds.x;
    obj.y = bounds.y;
    obj.width = bounds.width;
    obj.height = bounds.height;
}

Parser.prototype.adjustChildrenBounds = function(children, parent)
{
    var len = children.length;
    for(var j = 0; j < len; j++)
    {
        var childObj = children[j];
        if(this.isEmptyChild(childObj) == true)
        {
            childObj.x = 0;
            childObj.y = 0;
        }
        else
        {
            childObj.x = childObj.x - parent.x;
            childObj.y = childObj.y - parent.y;
            //语言设置容器,子元素坐标相对其父容器进行调整
            if(childObj.type == "Language")
            {
                for(var i = 0; i < childObj.children.length; i++)
                {
                    var subChild = childObj.children[i];
                    subChild.x += childObj.x;
                    subChild.y += childObj.y;
                }
            }
        }
    }
}

Parser.prototype.isEmptyChild = function(child)
{
    if(child.x == 0 && child.y == 0 && child.width == 0 && child.height == 0)
    {
        return true;
    }
    return false;
}

//=================检验解析结果==================
Parser.prototype.validateContainer = function(obj, parentPath)
{
    this.validateName(obj, parentPath);
    parentPath = parentPath + "/" + obj.name;
    this.validateChildren(obj, parentPath);
    var len = obj.children != null ? obj.children.length : 0;
    //var childNameMap = {};
    for(var i = 0; i < len; i++)
    {
        var child = obj.children[i];
        /*
        if(childNameMap[child.name] != null)
        {
            this.logError("容器[" + obj.name + "]中存在重名的子元素 " + child.name);
        }
        childNameMap[child.name] = true;
        */
        var validator = this.getTypeValidator(child.type);
        if(validator != null)
        {
            this[validator](child, parentPath);
        }
    }
}

Parser.prototype.validateImage = function(obj, parentPath)
{
    this.validateName(obj,  parentPath);
    for(var state in obj)
    {
        var stateObj = obj[state];
        if(stateObj instanceof Object)
        {
            if(stateObj.link != null)
            {
                var link = stateObj.link;
                var imageName = link.substring(link.indexOf(".") + 1);
                this.validateName({type:obj.type, name:imageName}, parentPath + "/" + state);
                var statePath = parentPath + "/" + obj.name + "/" + state + "/" + imageName;
                if(stateObj.top == undefined || stateObj.right == undefined || stateObj.bottom == undefined || stateObj.left == undefined)
                {
                    continue;
                }
                if((parseInt(stateObj.top) == 0 && parseInt(stateObj.bottom) != 0) || 
                    (parseInt(stateObj.top) != 0 && parseInt(stateObj.bottom) == 0))
                {
                    this.logError("九宫图像图层[" + statePath + "]九宫图片top和bottom必须同时为0!")
                }
                if((parseInt(stateObj.right) == 0 && parseInt(stateObj.left) != 0) || 
                    (parseInt(stateObj.right) != 0 && parseInt(stateObj.left) == 0))
                {
                    this.logError("九宫图像图层[" + statePath + "]九宫图片right和left必须同时为0!")
                }
                if((parseInt(stateObj.top) + parseInt(stateObj.bottom)) >= stateObj.height)
                {
                    this.logError("九宫图像图层[" + statePath + "]九宫图片top和bottom设置值只和不能大于图片的height值!")
                }
                if((parseInt(stateObj.right) + parseInt(stateObj.left)) >= stateObj.width)
                {
                    this.logError("九宫图像图层[" + statePath + "]九宫图片right和left设置值只和不能大于图片的width值!")
                }
            }
        }
    }
}

Parser.prototype.validateLabel = function(obj, parentPath)
{
    this.validateName(obj, parentPath);
}

Parser.prototype.validateChildren = function(obj, parentPath)
{
    var regExp = this.getTypeRegExp(obj.type);
    if(regExp == null)
    {
        return;
    }
    var requiredTotalNum = regExp.required.length;
    var children = obj.children;
    var len = children.length;
    outer:
    for(var i = 0; i < requiredTotalNum; i++)
    {
        var required = regExp.required[i];
        for(var j = 0; j < len; j++)
        {
            var child = children[j];
            var candidate = child.type + "_" + child.name;
            if(candidate.match(required) != null)
            {
                continue outer;
            }
        }
        var content = parentPath + "组件【" + obj.type + "_" + obj.name + "】格式错误!";
        content += "子元素 " + required.replace("$", "") + " 未找到 ";
        this.logError(content);
    }
}

Parser.prototype.validateName = function(obj, parentPath)
{
    if(obj.name.match(FIRST_TOKEN_REGEXP) != null)
    {
        this.logError(parentPath + "/" + obj.type + " 组件【" + obj.name + "【命名格式错误！命名以数字或特殊符号开始！" );
    }
    if(obj.name.match(CHINESE_CHAR_REGEXP) != null)
    {
        this.logError(parentPath + "/" + " 图层【" + obj.name + "【命名格式错误！名字中含有中文字符！" );
    }
}

Parser.prototype.getTypeRegExp = function(type)
{
    return this.typeSet[type].childrenRegExp;
}

Parser.prototype.getTypeValidator = function(type)
{
    return this.typeSet[type].validator;
}
//*************检验解析结果**************

Parser.prototype.logError = function(msg)
{
    throw new Error(msg);
}
