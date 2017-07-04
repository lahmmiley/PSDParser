var str = "\"WorldRedBagWindow\":\[\"WorldRedBagListWindow\", \"WorldRedBagSetWindow\", \"WorldRedBagInputWindow\"\]";

var patt = new RegExp("\"(.*?)\"", "g");

while(true)
{
    var result = patt.exec(str);
    if(result == null) break;
    alert(result[1]);
}

for(var i = 0; i < b.length; i++)
{
    //alert(b[i]);
}