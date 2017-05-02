const WORKBENCH = "workbench";

function ImageLayerExporter(environment)
{
    this.environment = environment;
    this.exportAssetMap = {};

    this.exportOptions = new ExportOptionsSaveForWeb();
    this.exportOptions.format = SaveDocumentType.PNG;
    this.exportOptions.PNG8 = false;
    this.exportOptions.transparency = true;
    this.exportOptions.interlaced = false;
    this.exportOptions.quality = 100;

    this.workbench = null;
}


ImageLayerExporter.prototype.export = function(extractData)
{
    this.exportAssetMap = {};
    this.emptyImageFolder();
    this.createWorkbench();
    this.exportAllLayers(extractData);
    this.destroyWorkbench();
    app.activeDocument = this.environment.doc;
}


ImageLayerExporter.prototype.emptyImageFolder = function()
{
    var folder = new Folder(this.environment.imageFolderPath + "/" + this.environment.psdName);
    if(folder.exists == true)
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
}

ImageLayerExporter.prototype.createWorkbench = function()
{
    this.workbench = app.documents.add(this.environment.doc.width, this.environment.doc.height, 72, WORKBENCH, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    app.activeDocument = this.environment.doc;
}

ImageLayerExporter.prototype.destroyWorkbench = function()
{
    this.workbench.close(SaveOptions.DONOTSAVECHANGES);
}

ImageLayerExporter.prototype.hideAllImageAndTextLayers = function(data)
{
    var children = data.children;
    for(var i = 0; i < children.length;i++)
    {
        var child = children[i];
        if(child.type == "image" || child.type == "text")
        {
            this.toggleLayerVisibility(false, child.layerIndex);
        }
        else if(child.type == "folder")
        {
            this.hideAllImageAndTextLayers(child);
        }
    }
}

ImageLayerExporter.prototype.exportImageLayer = function(data)
{
    if(this.environment.psdName == "Shared" || data.assetName.indexOf("Shared.") == -1)
    {
        var name = data.assetName.substring(data.assetName.indexOf(".") + 1);
        if(this.exportAssetMap[name] == null)
        {
            this.exportAssetMap[name] = 1;
            var imagePath = this.environment.imageFolderPath + "/" + this.environment.psdName + "/" + name + ".png";
            this.exportImageInWorkbench(data, imagePath);
            app.activeDocument = this.environment.doc;
        }
    }
}

ImageLayerExporter.prototype.exportAllLayers = function(data)
{
    var children = data.children;
    for(var i = 0; i < children.length; i++)
    {
        var child = children[i];
        if(child.visible == 1 && child.type == "image" && child.name.indexOf("placeholder") == -1)
        {
            this.exportImageLayer(child);
        }
        else if(child.visible == 1 && child.type == "folder" && child.name.toLowerCase() != "notexport")
        {
            this.exportAllLayers(child);
        }
    }
}

ImageLayerExporter.prototype.exportImageInWorkbench = function(data, imagePath)
{
    this.selectLayer(data.layerIndex);
    this.duplicateLayerToWorkbench(data.layerIndex);
    app.activeDocument = this.workbench;
    this.hideImageLayerSolidFillEffect();
    this.maximizeImageLayerAlpha(data);
    this.workbench.trim(TrimType.TRANSPARENT);
    this.workbench.exportDocument(new File(imagePath), ExportType.SAVEFORWEB, this.exportOptions);
    this.deleteWorkbenchLayer();
    this.workbench.resizeCanvas(this.environment.doc.width, this.environment.doc.height);
}

ImageLayerExporter.prototype.deleteWorkbenchLayer = function()
{
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putEnumerated(ST("layer"), ST("ordinal"), ST("targetEnum"));
    desc.putReference(ST("null"), ref);
    executeAction(ST("delete"), desc, DialogModes.NO);
}

ImageLayerExporter.prototype.duplicateLayerToWorkbench = function(layerIndex)
{
    var desc = new ActionDescriptor();
    var layerRef = new ActionReference();
    layerRef.putEnumerated(ST("layer"), ST("ordinal"), ST("targetEnum"));
    desc.putReference(ST("null"), layerRef);

    var docRef = new ActionReference();
    docRef.putName(ST("document"), WORKBENCH);
    desc.putReference(ST("to"), docRef);
    docRef.putIndex(ST("layer"), layerIndex);
    desc.putInteger(ST("version"), 5);
    executeAction(ST("duplicate"), desc, DialogModes.NO);
}

//检查workbench中activeLayer是否有叠加颜色效果
ImageLayerExporter.prototype.hasSolidFillEffect = function()
{
    var ref = new ActionReference();
    ref.putEnumerated(ST("layer"), ST("ordinal"), ST("targetEnum"));
    var desc = executeActionGet(ref);
    return desc.hasKey(ST("layerEffects")) && desc.getObjectValue(ST("layerEffects")).hasKey(ST("solidFill"));
}

ImageLayerExporter.prototype.hideImageLayerSolidFillEffect = function()
{
    if(this.hasSolidFillEffect() == true)
    {
        var desc = new ActionDescriptor();
        var list = new ActionList();
        var ref = new ActionReference();
        ref.putClass(ST("solidFill"));
        ref.putEnumerated(ST("layer"), ST("ordinal"), ST("targetEnum"));
        list.putReference(ref);
        desc.putList(ST("null"), list);
        executeAction(ST("hide"), desc, DialogModes.NO);
    }
}

ImageLayerExporter.prototype.selectLayer = function(layerIndex)
{
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putIndex(ST("layer"), layerIndex);
    desc.putReference(ST("null"), ref);
    executeAction(ST("select"), desc, DialogModes.NO);
}

ImageLayerExporter.prototype.maximizeImageLayerAlpha = function(data)
{
    if(data.alpha < 1)
    {
        var setDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated(ST("layer"), ST("ordinal"), ST("targetEnum"));
        setDesc.putReference(ST("null"), ref);
        var toDesc = new ActionDescriptor();
        toDesc.putUnitDouble(ST("opacity"), ST("percentUnit"), 100);
        setDesc.putObject(ST("to"), ST("layer"), toDesc);
        executeAction(ST("set"), setDesc, DialogModes.NO);
    }
}
