const WORKBENCH = "workbench";

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
}

ImageExporter.prototype.createWorkbench = function()
{
    this.workbench = app.documents.add(this.env.width, this.env.height, 72, WORKBENCH, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
}

ImageExporter.prototype.exportAllLayers = function(data)
{
    app.activeDocument = this.currentActiveDocument;
    var children = data.children;
    for(var i = 0; i < children.length; i++)
    {
        var child = children[i];
		if(child.children.length == 0)
		{
			if(child.type == TYPE_IMAGE)
			{
				this.exportImageLayer(child);
			}
		}
		else
		{
            this.exportAllLayers(child);
		}
    }
}

ImageExporter.prototype.exportImageLayer = function(data)
{
    var name = data.name;
    if((data.belongPsd == this.env.name) && (this.assetMap[name] == null))
    {
        this.assetMap[name] = 1;
        var imagePath = this.imageExportPath + name + ".png";
        this.exportImageInWorkbench(data, imagePath);
    }
}

ImageExporter.prototype.exportImageInWorkbench = function(data, imagePath)
{
    this.selectLayer(data);
    this.duplicateLayerToWorkbench(data);
    app.activeDocument = this.workbench;
    this.workbench.trim(TrimType.TRANSPARENT);
	this.workbench.exportDocument(new File(imagePath), ExportType.SAVEFORWEB, this.exportOptions);
	this.deleteWorkbenchLayer();
	this.workbench.resizeCanvas(this.env.width, this.env.height);
    app.activeDocument = this.currentActiveDocument;
}

ImageExporter.prototype.selectLayer = function(data)
{
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putIndex(ST("layer"), data.layerIndex);
    desc.putReference(ST("null"), ref);
    executeAction(ST("select"), desc, DialogModes.NO);
}

ImageExporter.prototype.duplicateLayerToWorkbench = function(data)
{
    var desc = new ActionDescriptor();
    var layerRef = new ActionReference();
    layerRef.putEnumerated(ST("layer"), ST("ordinal"), ST("targetEnum"));
    desc.putReference(ST("null"), layerRef);

    var docRef = new ActionReference();
    docRef.putName(ST("document"), WORKBENCH);
    desc.putReference(ST("to"), docRef);
    docRef.putIndex(ST("layer"), data.layerIndex);
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
