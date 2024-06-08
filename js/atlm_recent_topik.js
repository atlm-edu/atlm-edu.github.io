        var ListBlogLink = "https://ahli-teknologi-laboratorium-medik.blogspot.com/";
        var ListCount = 4;
        var ChrCount = 45;
        var TitleCount = 100;
        var ImageSize = 140;
        var showcomments = "off";
        var showdate = "on";
        var showauthor = "off";
        var showthumbnail = "off";
        var showlabel = "off";
        var showcontent = "off";
        var showTotal = "off";
        var showread = "on"; // New variable for topik-read

        function atlmlabelfilter(json, containerId) {
            const container = document.getElementById(containerId);
            container.innerHTML = ''; // Clear existing content

            json.feed.entry.slice(0, ListCount).forEach((entry, i) => {
                let ListTag = '', ListUrl = '', ListTitle = '', ListComments = '', ListAuthor = '', AuthorPic = '', ListContent = '', ListDate = '', ListUpdate = '', ListImage = '';

                if (entry.category) {
                    entry.category.forEach((cat, k) => {
                        ListTag += `<a href='${ListBlogLink}/search/label/${cat.term}'>${cat.term}</a>`;
                        if (k < entry.category.length - 1) ListTag += ' ';
                    });
                }

                const alternateLink = entry.link.find(link => link.rel === 'alternate');
                ListUrl = alternateLink.href;

                if (entry.title) ListTitle = entry.title.$t.substr(0, TitleCount);
                if (entry.thr$total) ListComments = `<a href='${alternateLink.href}#comment-form'>${entry.thr$total.$t}</a>`;

                ListAuthor = entry.author[0].name.$t.split(" ")[0];
                AuthorPic = entry.author[0].gd$image.src;

                ListContent = entry.content.$t.replace(/(<([^>]+)>)/ig, "").substring(0, ChrCount);

                const ListMonth = ["Januari", "Febuari", "Maret", "April", "May", "Juni", "Juli", "Augustus", "September", "October", "November", "December"];
                ListDate = entry.published.$t.substring(0, 10);
                const [Y, m, D] = [ListDate.substring(0, 4), ListDate.substring(5, 7), ListDate.substring(8, 10)];
                const M = ListMonth[parseInt(m) - 1];

                ListUpdate = entry.updated.$t.substring(0, 16);
                const [YY, mm, DD, TT] = [ListUpdate.substring(0, 4), ListUpdate.substring(5, 7), ListUpdate.substring(8, 10), ListUpdate.substring(11, 16)];
                const MM = ListMonth[parseInt(mm) - 1];

                const youtubeMatch = entry.content.$t.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/);
                if (youtubeMatch && youtubeMatch[2].length === 11) {
                    ListImage = `//img.youtube.com/vi/${youtubeMatch[2]}/0.jpg`;
                } else if (entry.media$thumbnail) {
                    const thumbUrl = entry.media$thumbnail.url.replace("/s72-c/", `/s${ImageSize}-c/`);
                    ListImage = thumbUrl.replace("?imgmax=800", "");
                } else {
                    const imgMatch = entry.content.$t.match(/src=(.+?[\.jpg|\.gif|\.png]")/);
                    if (imgMatch) {
                        ListImage = imgMatch[1];
                    } else {
                        ListImage = 'https://3.bp.blogspot.com/-d7epv7xdukI/XELxKqnvlYI/AAAAAAAAAdI/qkPKvbRx4S4xN58hSun4QLBIiJvDlUI0wCLcBGAs/s120-c/no-image.jpg';
                    }
                }

                const postDiv = document.createElement('div');
                postDiv.className = `post-topik-home topik-${i}`;

                const itemBody = document.createElement('div');
                itemBody.className = 'topik-item-body';

                if (showthumbnail === 'on') {
                    const imageDiv = document.createElement('div');
                    imageDiv.className = 'topik-item-image';
                    imageDiv.innerHTML = `<a href=${ListUrl}><img src=${ListImage} /></a>`;
                    itemBody.appendChild(imageDiv);
                }

                if (showdate === 'on') {
                    const dateSpan = document.createElement('span');
                    dateSpan.className = 'topik-date';
                    dateSpan.textContent = `${D} ${M} ${Y}`;
                    itemBody.appendChild(dateSpan);
                }

                const title = document.createElement('h4');
                title.innerHTML = `<a class='topik-title' href=${ListUrl}>${ListTitle}</a>`;
                itemBody.appendChild(title);

                if (showcontent === 'on') {
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'topik-content';
                    contentDiv.textContent = `${ListContent}...`;
                    itemBody.appendChild(contentDiv);
                }

                postDiv.appendChild(itemBody);

                const itemFooter = document.createElement('div');
                itemFooter.className = 'topik-item-footer';

                if (showread === 'on') {
                    const readDiv = document.createElement('div');
                    readDiv.className = 'topik-read';
                    readDiv.innerHTML = `<a class='topik-read-link' href=${ListUrl}>Baca</a>`;
                    itemFooter.appendChild(readDiv);
                }

                if (showlabel === 'on') {
                    const tagSpan = document.createElement('span');
                    tagSpan.className = 'topik-tag';
                    tagSpan.innerHTML = ListTag;
                    itemFooter.appendChild(tagSpan);
                }

                if (showauthor === 'on') {
                    const authorSpan = document.createElement('span');
                    authorSpan.className = 'topik-author';
                    authorSpan.innerHTML = `<img class='topik-authorpic' src='${AuthorPic}'/>${ListAuthor}`;
                    itemFooter.appendChild(authorSpan);
                }

                if (showcomments === 'on') {
                    const commentsSpan = document.createElement('span');
                    commentsSpan.className = 'topik-comments';
                    commentsSpan.innerHTML = ListComments;
                    itemFooter.appendChild(commentsSpan);
                }

                postDiv.appendChild(itemFooter);
                container.appendChild(postDiv);
            });

            if (showTotal === 'on') {
                const totalDiv = document.createElement('div');
                totalDiv.className = 'topik-total';
                totalDiv.innerHTML = `<span><a href='${ListBlogLink}/search/label/${ListLabel}'>Lihat semua</a></span>`;
                container.appendChild(totalDiv);
            }
        }

        // Load the JSON feed for "Pemeriksaan"
        const pemeriksaanScript = document.createElement('script');
        pemeriksaanScript.src = "https://www.atlm-edu.id/feeds/posts/default/-/Pemeriksaan?orderby=published&alt=json-in-script&callback=pemeriksaanCallback";
        document.body.appendChild(pemeriksaanScript);

        // Load the JSON feed for "Pengetahuan"
        const pengetahuanScript = document.createElement('script');
        pengetahuanScript.src = "https://www.atlm-edu.id/feeds/posts/default/-/Pengetahuan?orderby=published&alt=json-in-script&callback=pengetahuanCallback";
        document.body.appendChild(pengetahuanScript);

        // Define the callback functions
        function pemeriksaanCallback(json) {
            atlmlabelfilter(json, 'pemeriksaan-container');
        }

        function pengetahuanCallback(json) {
            atlmlabelfilter(json, 'pengetahuan-container');
        }