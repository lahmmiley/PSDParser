//Enviroment相当于全局类，被所有类所保存，
//Enviroment类主要的作用是存储文件名与路径
function Environment(doc)
{
    this.doc = doc;
    this.psdFullName = doc.name;
    this.psdName = this.getPsdName(doc.name).replace(/\.(psd|png)/i, "");
    this.psdPath = doc.path + "/" + doc.name;
    this.psdFolderPath = String(doc.path);

    this.imageFolderPath = this.psdFolderPath.replace("Psd", "Image");
    this.jsonFolderPath = this.psdFolderPath.replace("Psd", "Json");
    this.xmlFolderPath = this.psdFolderPath.replace("Psd", "Xml"); 
}


Environment.prototype.getPsdName = function(rawName)
{
    var rawNameSplit = rawName.split("$");
    if(rawNameSplit.length == 2)
    {
        return rawNameSplit[1];
    }
    return rawName;
}

