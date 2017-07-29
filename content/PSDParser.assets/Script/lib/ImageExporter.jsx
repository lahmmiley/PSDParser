const WORKBENCH = "workbench";
const PLACEHOLDER = "placeholder"

function ImageExporter(env)
{
	this.env = env;
	this.imageExportPath = this.env.imageFolderPath + this.env.name + "/";
    var folder = new Folder(this.imageExportPath);
    if(folder.exists)
    {
        var files = folder.getFiles();
        for(var i = 0;i < files.length;i++)
        {
           files[i].remove();
        }
    }
	else
	{
        folder.create();
	}

    this.exportOptions = new ExportOptionsSaveForWeb();
    this.exportOptions.format = SaveDocumentType.PNG;
    this.exportOptions.PNG8 = false;
    this.exportOptions.transparency = true;
    this.exportOptions.interlaced = false;

    this.currentActiveDocument = app.activeDocument;
}

ImageExporter.prototype.export = function(root)
{
    this.assetMap = {};
    this.createWorkbench();
    this.exportAllLayers(root);
    app.activeDocument = this.workbench;
    this.close();
    app.activeDocument = this.currentActiveDocument;
    this.writeImageData()
}

ImageExporter.prototype.createWorkbench = function()
{
    this.workbench = app.documents.add(this.env.width, this.env.height, 72, WORKBENCH, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
}

ImageExporter.prototype.exportAllLayers = function(node)
{
    app.activeDocument = this.currentActiveDocument;
    var children = node.children;
    for(var i = 0; i < children.length; i++)
    {
        var child = children[i];
		if(child.type == TYPE_IMAGE)
		{
			this.exportImageLayer(child);
		}
		else
		{
            this.exportAllLayers(child);
		}
    }
}

ImageExporter.prototype.exportImageLayer = function(node)
{
    if(this.exportable(node))
    {
        var name = node.name;
        this.assetMap[name] = node;
        var imagePath = this.imageExportPath + name + PNG_POSTFIX;
        this.exportImageInWorkbench(node, imagePath);
    }
}

ImageExporter.prototype.exportImageInWorkbench = function(node, imagePath)
{
    this.selectLayer(node);
    this.duplicateLayerToWorkbench(node);
    app.activeDocument = this.workbench;
    this.workbench.trim(TrimType.TRANSPARENT);
	this.workbench.exportDocument(new File(imagePath), ExportType.SAVEFORWEB, this.exportOptions);
	this.deleteWorkbenchLayer();
	this.workbench.resizeCanvas(this.env.width, this.env.height);
    app.activeDocument = this.currentActiveDocument;
}

ImageExporter.prototype.selectLayer = function(node)
{
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putIndex(ST("layer"), node.layerIndex);
    desc.putReference(ST("null"), ref);
    executeAction(ST("select"), desc, DialogModes.NO);
}

ImageExporter.prototype.duplicateLayerToWorkbench = function(node)
{
    var desc = new ActionDescriptor();
    var layerRef = new ActionReference();
    layerRef.putEnumerated(ST("layer"), ST("ordinal"), ST("targetEnum"));
    desc.putReference(ST("null"), layerRef);

    var docRef = new ActionReference();
    docRef.putName(ST("document"), WORKBENCH);
    desc.putReference(ST("to"), docRef);
    docRef.putIndex(ST("layer"), node.layerIndex);
    desc.putInteger(ST("version"), 5);
    executeAction(ST("duplicate"), desc, DialogModes.NO);
}

ImageExporter.prototype.deleteWorkbenchLayer = function()
{
	var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putEnumerated(ST("layer"), ST("ordinal"), ST("targetEnum"));
    desc.putReference(ST("null"), ref);
    executeAction(ST("delete"), desc, DialogModes.NO);
}

ImageExporter.prototype.close = function()
{
    var idCls = charIDToTypeID( "Cls " );
    var desc30 = new ActionDescriptor();
    var idSvng = charIDToTypeID( "Svng" );
    var idYsN = charIDToTypeID( "YsN " );
    var idN = charIDToTypeID( "N   " );
    desc30.putEnumerated( idSvng, idYsN, idN );
    executeAction( idCls, desc30, DialogModes.NO );
}

ImageExporter.prototype.writeImageData = function()
{
    var env = this.env;
    var imageDataPath = env.dataFolderPath + env.name + IMAGE_DATA + JSON_POSTFIX;
    var content = this.getImageData();
    new FileWriter(env).write(imageDataPath, content);
}

ImageExporter.prototype.getImageData = function()
{
    var content = "[\n";
    var first = true;
    for(key in this.assetMap)
    {
        var node = this.assetMap[key];
        content += TAB + "{\"Name\":" + "\"" + key + "\",";
        var param = node.getParamByType(PARAMETER_MIRROR)
        if(param != null)
        {
            content += " \"Mirror\":\"" + param.value + "\",";
        }

        content = content.substring(0, content.length - 1);
        content += "},\n";
    }
    content = content.substring(0, content.length - 2);
    content += "\n]";
    return content;
}


ImageExporter.prototype.exportable = function(node)
{
    var name = node.name;
    if((node.belongPsd == this.env.name) &&
        (this.assetMap[name] == null) &&
        (name.toLowerCase() != PLACEHOLDER))
    {
       return SUCCESS;
    }
    return FAILURE;
}
