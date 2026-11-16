import siteData from './siteData.json' with { type: 'json'};
import directory from './directory.json' with { type: 'json'};

const app = document.querySelector("#app");

// const metaDescription = document.querySelector('meta[name="description');

const route = async () => {
    const URL = window.location.hash.slice(1);
    
    const path = URL.match(/^[^\?]+/)?.[0] ?? "home";
    const tagParam = URL.match(/\?\S+/)?.[0];
    
    const type = directory[path]?.type ?? directory["404"].type;
    const index = directory[path]?.index ?? directory["404"].index;
    
    let html = siteData[type][index].htmlContent;
    app.innerHTML = html;
    
    if (tagParam && path == "blog") {
        const blogPostListTable = document.querySelector(".blogPostListTable");
        const tag = tagParam.match(/(?<=\=)\S+$/)?.[0]
        const rows = document.querySelectorAll(`tr:not(:has(td.${tag}))`);

        const tagTitle = document.createElement("h1")
        tagTitle.textContent = `${tag}`;
        console.log(blogPostListTable)
        
        blogPostListTable.prepend(tagTitle);

        rows.forEach(row => {
            row.style.display = "none";
        })
    }
    
    
    
    // Else (Blog Post)
    // else {
    //     const post = siteData.posts.find(post => post.slug == URL);
    //     app.innerHTML =post.htmlContent; 
    // }


    
    // Set Meta Data
    // document.title = frontmatter.title || "Untitiled Page";
    // metaDescription.setAttribute("content", frontmatter.description);

    // Replace HTML
}


window.addEventListener('DOMContentLoaded', route);
window.addEventListener('hashchange', route);