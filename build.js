// IMPORT LIBRARY
const fs = require("fs")
const path = require("path")
const { marked } = require("marked")
const matter = require("gray-matter")

// CONFIG DIR AND PATH
const PAGES_DIR = "./pages/"
const POSTS_DIR = "./pages/posts/"
const DIST = "./dist/"
const DIRECTORY = "directory.json"

const allTags = new Set()

// CONFIG FORMATTING
const formatDate = new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric"
})

const addContainer = (htmlContent, className) => {
        return `<div class="${className}">${htmlContent}</div>`
}

// THE BUILD FUNCTION
const genDirectoryJsonArray = () => {
        // ADD PAGES TO DIRECOTRY 
        const directory = []
        const pagesList = fs.readdirSync(PAGES_DIR).filter(file => file.endsWith(".md"))
        pagesList.forEach(pageFileName => {
                const page = fs.readFileSync(path.join(PAGES_DIR, pageFileName))
                const { data, content } = matter(page)
                const fileName = pageFileName.slice(0,-3)
                directory.push({
                        type: "page",
                        slug: fileName,
                        title: data.title,
                        description: data.description,
                        html: addContainer(content,`${fileName}-container`)
                })
        });

        // ADD POSTS TO DIRECTORY
        const postsList = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith(".md"))
        postsList.forEach(postFileName => {
                const post = fs.readFileSync(path.join(POSTS_DIR, postFileName))
                const { data, content } = matter(post)
                const fileName = postFileName.slice(0,-3)

                const formattedDate = formatDate.format(data.date).replace(/(\w{3}) (\d{4})$/, "$1, $2")
                
                // Create Title section automatically
                let postTitleHead = `<div class="post-head"><h1>${data.title}</h1><p><i><time datetime="${data.date}">${formattedDate}</time></i></p></div>`

                // Create related section automatically
                let relatedSection = `<div class="related">`
                data.tags.forEach((tag,index) => {
                        if (index == data.tags.length) {
                                relatedSection += `<span><a class="tag" href="#blog?tag=${tag}>${tag}</a></span>`
                        } else {
                                relatedSection += `<span><a class="tag" href="#blog?tag=${tag}>${tag}</a> · </span>`
                        }
                })
                relatedSection += `</div>`

                // Apply HTML changes
                const html = postTitleHead + content + relatedSection

                directory.push({
                        type: "post",
                        slug: fileName,
                        title: data.title,
                        description: data.description,
                        date: data.date,
                        formattedDate: formattedDate,
                        tags: data.tags.sort(),
                        html: addContainer(html,`${fileName}-container`)
                })

        });
        return directory
}

const createBlogPage = (directory) => {
        const allPosts = directory.filter(a => a.type == "post").sort((a,b) => new Date(b.date) - new Date(a.date));
        create
}

const dir = genDirectoryJsonArray();
createBlogPage(dir)









// // Delete /dist
// fs.rmSync(DIST, {recursive: true, force: true});
// // Create new /dist
// fs.mkdirSync('./dist/');




// // sort blog by date
// validPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

// // create sorted array of allTags
// const sortedAllTags = [...allTags].sort();

// // Create `most recent` and `blog post` list
// let postsListpageHTML = "<div class='blog-posts-container'><ul class='blog-posts'>";
// let mostRecentPostTable = "<section><h2>Most Recent Posts</h2><div class='most-recent-blog-posts-container'><ul class='blog-posts'>";

// const loopMaxForMostRecent = 5;
// let i = 0;
// validPosts.forEach(post => {
//     //append most recent
//     const append = `<li class="data-tags">
//         <span class="date"><i><time datetime="${post.date}">${post.formattedDate}</time></i></span>
//         <span class="title"><a href="#${post.slug}">${post.title}</a></span>
//     `;
//     postsListpageHTML += append + `<span class="tags">`;
//     if (i < loopMaxForMostRecent) {
//         mostRecentPostTable += append + `</li>`;
//         i++
//     }
    
//     post.tags.forEach(tag => {
//         postsListpageHTML += `<a class="${tag}" href="#blog?tag=${tag}">${tag}</a>\n`
//     })
//     postsListpageHTML += `</span></li>`;
// })
// postsListpageHTML += '</div>'
// mostRecentPostTable += '</div></section>'

// validPages.push({
//     slug: "blog",
//     title: "blog",
//     description: "blog",
//     htmlContent: postsListpageHTML
// })


// // Append `most recent posts` section to home page
// const homePage = validPages.find(page => page.slug == "home");
// let homePageHTML = homePage.htmlContent;
// homePageHTML += mostRecentPostTable;
// homePage.htmlContent = homePageHTML;

// // Create `topics` page
// let topicHTML = `<div class="topic-list-container"><ul>`;
// sortedAllTags.forEach( tag => {
//     topicHTML += `<li class="topic"><a href="#blog?tag=${tag}">${tag}</a></li>`
// })
// topicHTML += `</ul></div>`;
// // Push content
// validPages.push({
//     slug: "topic",
//     title: "topic",
//     description: "blog",
//     htmlContent: topicHTML
// })


// const siteData = {
//     "pages": validPages,
//     "posts": validPosts
// }

// // Creating `directory` file
// for (const [type, arr] of Object.entries(siteData)) {
//     arr.map((dic, index) => {
//         const slug = dic.slug
//         directory[slug] = {
//             "type": type,
//             "index": index
//         }
//     })
// }

// fs.writeFileSync(path.join('./src/',SITE_DATA_JSON), JSON.stringify(siteData));
// fs.writeFileSync(path.join('./src/',DIRECTORY_DIR), JSON.stringify(directory));

// // Add Static Content (./src)
// fs.cpSync('./src', './dist/src/', { recursive: true});
// fs.cpSync('./public','./dist/public/', { recursive: true});
// fs.cpSync('index.html', './dist/index.html');

// console.log("DONE!");

