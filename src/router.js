import directory from './directory.json' with { type: 'json'};

const app = document.querySelector("#app");
const metaDescription = document.querySelector('meta[name="description"]');
const metaTitle = document.querySelector('meta[name="title"]');


const findElement = (path, directory) => {
    return directory.find(a => a.slug == path) ?? directory.find(a => a.slug == "404")
}

const route = () => {
    const params = {}
    const URL = window.location.hash.slice(1);
    const splittedURL = URL.split("?")

    const path = splittedURL[0]
    const queryParams = splittedURL?.[1]?.split("&") ?? []
    queryParams.forEach( param => {
        const pair = param.split("=")
        params[pair[0]] = pair[1]
    })

    console.log(path, params)

    const element = findElement(path, directory)

    document.title = `${element.title} - Punyawat's blog`
    metaTitle.setAttribute("content", `${element.title} - Punyawat's blog`)
    metaDescription.setAttribute("content", element.description)

    let html = element.html
    app.innerHTML = html
    
    // add ability to filter by tag 
    if (path == "blog" && params.hasOwnProperty("tag")) {
        const blogPostsContainer = document.querySelector(".blog-posts-container")
        const rowsNotMatch = document.querySelectorAll(`.blog-posts-container li:not(:has(span.${params.tag}))`)
        const displayTag = params.tag.replace(/^./, char => char.toUpperCase())
        
        let tagTitle = document.createElement("h1")
        tagTitle.innerText = displayTag
        
        blogPostsContainer.prepend(tagTitle)
        
        document.title = `${displayTag} - Punyawat's blog`

        rowsNotMatch.forEach( row => {
            row.style.display = "none"
        })   
    }
}

window.addEventListener('DOMContentLoaded', route);
window.addEventListener('hashchange', route);