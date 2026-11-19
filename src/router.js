import siteData from './siteData.json' with { type: 'json'};
import directory from './directory.json' with { type: 'json'};

const app = document.querySelector("#app");

const metaDescription = document.querySelector('meta[name="description"]');
const metaTitle = document.querySelector('meta[name="title"]');

const route = async () => {
    const URL = window.location.hash.slice(1);
    
    const path = URL.match(/^[^\?]+/)?.[0] ?? "home";
    const tagParam = URL.match(/\?\S+/)?.[0];
    
    const type = directory[path]?.type ?? directory["404"].type;
    const index = directory[path]?.index ?? directory["404"].index;
    
    document.title = `${siteData[type][index].title} - Punyawat's blog`;
    
    metaDescription.setAttribute('content',siteData[type][index].description);
    metaTitle.setAttribute('content',siteData[type][index].title);

    
    
    let html = siteData[type][index].htmlContent;
    app.innerHTML = html;
    
    
    if (tagParam && path == "blog") {
        const blogPostsContainer = document.querySelector(".blog-posts-container");
        const tag = tagParam.match(/(?<=\=)\S+$/)?.[0]
        const rows = document.querySelectorAll(`.data-tags:not(:has(a.${tag}))`);

        const tagTitle = document.createElement("h1")
        tagTitle.textContent = `${tag}`;
        
        blogPostsContainer.prepend(tagTitle);

        rows.forEach(row => {
            row.style.display = "none";
        })
    }
}

window.addEventListener('DOMContentLoaded', route);
window.addEventListener('hashchange', route);