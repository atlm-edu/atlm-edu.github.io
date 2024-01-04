function atlmlabelfilter(json) {
document.write('<div class="atlm-filter-topik">');
for (var i = 0; i < ListCount; i++)
{
var listing= ListImage = ListUrl = ListTitle = ListImage = ListContent = ListConten = ListAuthor = ListTag = ListDate = ListUpdate = ListComments = thumbUrl = TotalPosts = sk = AuthorPic= ListMonth = Y = D = M = m = YY = DD = MM = mm = TT =  "";
if (json.feed.entry[i].category != null)
{
for (var k = 0; k < json.feed.entry[i].category.length; k++) {
ListTag += "<a href='"+ListBlogLink+"/search/label/"+json.feed.entry[i].category[k].term+"'>"+json.feed.entry[i].category[k].term+"</a>";
if(k < json.feed.entry[i].category.length-1)
{ ListTag += " ";}
}}
for (var j = 0; j < json.feed.entry[i].link.length; j++) {
      if (json.feed.entry[i].link[j].rel == 'alternate') {
        break;
      }
    }
ListUrl= "'" + json.feed.entry[i].link[j].href + "'";
TotalPosts = json.feed.openSearch$totalResults.$t;
if (json.feed.entry[i].title!= null)
{
ListTitle= json.feed.entry[i].title.$t.substr(0, TitleCount);
}
if (json.feed.entry[i].thr$total)
{
ListComments= "<a href='"+json.feed.entry[i].link[j].href+"#comment-form'>"+json.feed.entry[i].thr$total.$t+"</a>";
}
ListAuthor= json.feed.entry[i].author[0].name.$t.split(" ");
ListAuthor=ListAuthor.slice(0, 1).join(" ");
AuthorPic = json.feed.entry[i].author[0].gd$image.src;
ListConten = json.feed.entry[i].content.$t;
ListContent= ListConten.replace(/(<([^>]+)>)/ig,"").substring(0, ChrCount);
ListMonth= ["Januari", "Febuari", "Maret", "April", "May", "Juni", "Juli", "Augustus", "September", "October", "November", "December"];
ListDate= json.feed.entry[i].published.$t.substring(0,10);

                         Y = ListDate.substring(0, 4);
                        m = ListDate.substring(5, 7);
                         D = ListDate.substring(8, 10);
                         M = ListMonth[parseInt(m - 1)];                       

ListUpdate= json.feed.entry[i].updated.$t.substring(0, 16);

                         YY = ListUpdate.substring(0, 4);
                        mm = ListUpdate.substring(5, 7);
                         DD = ListUpdate.substring(8, 10);
                         TT = ListUpdate.substring(11, 16);
                         MM = ListMonth[parseInt(mm - 1)];   


if (json.feed.entry[i].content.$t.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/) != null)
{
    var youtube_id = json.feed.entry[i].content.$t.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/).pop();
    if (youtube_id.length == 11) {
        var ListImage = "'//img.youtube.com/vi/"+youtube_id+"/0.jpg'";
        }
}
else if (json.feed.entry[i].media$thumbnail)
{
thumbUrl = json.feed.entry[i].media$thumbnail.url;
sk= thumbUrl.replace("/s72-c/","/s"+ImageSize+"-c/");
ListImage= "'" + sk.replace("?imgmax=800","") + "'";
}
else if (json.feed.entry[i].content.$t.match(/src=(.+?[\.jpg|\.gif|\.png]")/) != null)
{
// Support For 3rd Party Images
ListImage =  json.feed.entry[i].content.$t.match(/src=(.+?[\.jpg|\.gif|\.png]")/)[1];
}
else
{
ListImage= "'https://3.bp.blogspot.com/-d7epv7xdukI/XELxKqnvlYI/AAAAAAAAAdI/qkPKvbRx4S4xN58hSun4QLBIiJvDlUI0wCLcBGAs/s120-c/no-image.jpg'";
}
document.write("<div class='post-topik-home topik-"+[i]+"' ><div class='topik-item-body'>");
if (showthumbnail == 'on'){
document.write("<div class='topik-item-image'><a  href=" +ListUrl+ "><img src=" +ListImage+ "/></a></div>");
}
if (showdate == 'on'){
document.write("<span class='topik-date'>" + M +" "+ D +", "+ Y + "</span>");
}
document.write("<h4><a class='topik-title' href=" +ListUrl+ ">" + ListTitle+ "</a></h4>");
if (showcontent == 'on'){
document.write("<div class='topik-content'>" +ListContent+ "...</div> ");
}
document.write("</div>");
document.write("<div class='topik-item-footer'>");
document.write("<div class='topik-read'><a class='topik-read-link' href=" +ListUrl+ ">Baca</a></div>");
if (showlabel == 'on'){
document.write("<span class='topik-tag'>" +ListTag+ "</span>");
}
if (showauthor == 'on'){
document.write("<span class='topik-author'><img class='topik-authorpic' src='"+AuthorPic+"'/>" +ListAuthor+ "</span>");
}
if (showcomments == 'on'){
document.write("<span class='topik-comments'>" +ListComments+ "</span> ");
}
document.write("</div></div>");

}if (showTotal == 'on'){
document.write("<div class='topik-total'><span><a href='"+ListBlogLink+"/search/label/"+ListLabel+"'>Lihat semua</a></span></div>");
}
document.write("</div>");
}