var str = "\"WorldRedBagWindow\":\[\"WorldRedBagListWindow\", \"WorldRedBagSetWindow\", \"WorldRedBagInputWindow\"\]";

var patt = new RegExp("\"(.*?)\"", "g");

while(true)
{
    var result = patt.exec(str);
    if(result == null) break;
    alert(result.length)
    alert(result[0]);
}
