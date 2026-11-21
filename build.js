// IMPORT LIBRARY
const fs = require("fs")
const path = require("path")
const { marked } = require("marked")
const matter = require("gray-matter")

// CONFIG DIR AND PATH
const PAGES_DIR = "./pages/"
const POSTS_DIR = "./pages/posts/"
const DIST = "./dist/"
const DIRECTORY_DIR = "directory.json"

// CONFIG FORMATTING
const formatDate = new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit"
})
const numberOfMostRecentPost = 5;

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
                const slug = (fileName == "home") ? "" : fileName // change the slug of `home` to empty string
                let html = marked(content)
                let postTitleHead = `<div class="page-head"><h1>${data.title}</h1></div>`
                html = postTitleHead+html
                directory.push({
                        type: "page",
                        slug: slug,
                        title: data.title,
                        description: data.description,
                        html: addContainer(html,`${fileName}-container`)
                })
        });

        // ADD POSTS TO DIRECTORY
        const postsList = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith(".md"))
        postsList.forEach(postFileName => {
                const post = fs.readFileSync(path.join(POSTS_DIR, postFileName))
                const { data, content } = matter(post)
                const fileName = postFileName.slice(0,-3)
                const formattedDate = formatDate.format(data.date).replace(/(\w{3}) (\d{4})$/, "$1, $2")
                let html = addContainer(marked(content),"post-body")
                
                // Create Title section automatically
                let postTitleHead = `<div class="post-head"><h1>${data.title}</h1><p><i><time datetime="${data.date}">${formattedDate}</time></i></p><hr></div>`
                // Create related section automatically
                let relatedSection = `<div class="related"><p>Related</p>`
                data.tags.forEach((tag,index) => {
                        if (index == data.tags.length-1) {
                                relatedSection += `<span><a class="tag" href="#blog?tag=${tag.toLowerCase()}">${tag}</a></span>`
                        } else {
                                relatedSection += `<span><a class="tag" href="#blog?tag=${tag.toLowerCase()}">${tag}</a> · </span>`
                        }
                })
                relatedSection += `</div>`
                console.log(relatedSection)
                // Apply HTML changes
                html = postTitleHead + html + relatedSection
                // -----------------------------------

                directory.push({
                        type: "post",
                        slug: fileName,
                        title: data.title,
                        description: data.description,
                        date: data.date,
                        formattedDate: formattedDate,
                        tags: data.tags.sort(),
                        html: addContainer(html,`post-container`)
                })

        });
        return directory
}

const createBlogPage = (directory) => {
        const allPosts = directory.filter(a => a.type == "post").sort((a,b) => new Date(b.date) - new Date(a.date))
        let html = `<ul class="blog-posts">`
        allPosts.forEach(post => {
                html += `
                <li>
                        <span class="blog-date">
                                <i>
                                        <time datetime ="${post.date}">
                                                ${post.formattedDate}
                                        </time>
                                </i>
                        </span>
                        <span class="blog-title">
                                <a href="#${post.slug}">
                                        ${post.title}
                                </a>
                        </span>
                        <span class="blog-tags">`
                post.tags.forEach(tag => {
                        html += `
                        <span class="blog-tag ${tag.toLowerCase()}">
                                <a href="#blog?tag=${tag.toLowerCase()}">
                                        ${tag}
                                </a>
                        </span>`
                })
                html += `</span></li>`
        }) 
        html += `</ul>`
        return {
                type: "page",
                slug: "blog",
                title: "blog",
                description: "blog archive",
                html: addContainer(html,`blog-posts-container`)
        }
}

const createTopicsPage = (directory) => {
        // Find all tag available and store in a set
        const allTagsAvailable = new Set()
        directory.filter(a => a.type == "post").forEach(post => {
                post.tags.forEach(tag => {
                        allTagsAvailable.add(tag)
                })
        })
        tagArr = Array.from(allTagsAvailable).sort()

        // Create a html content
        let html = `<ul class="topics-list">`
        tagArr.forEach(tag => {
                html += `<li class="topic"><a href="#blog?tag=${tag.toLowerCase()}">${tag}</a></li>`
        })
        html += `</ul>`
        return {
                type: "page",
                slug: "topic",
                title: "tags",
                description: "filter by tags",
                html: addContainer(html,`tags-list-container`)
        }
}
const createMostRecentSection = (directory, recentsNum) => {
        let html = `<section><h2>Most Recent Posts</h2><div class='most-recent-blog-posts-container'><ul class='blog-posts'>`
        directory.filter(a => a.type == "post").sort((a,b) => new Date(b.date) - new Date(a.date)).every( (post,index) => {
                if (index < recentsNum) {
                        html += `<li>
                        <span class="blog-date"><i><time datetime ="${post.date}">${post.formattedDate}</time></i></span>
                        <span class="blog-title"><a href="#${post.slug}">${post.title}</a></span>
                        </li>`
                        return true
                } else {
                        return false
                }
        })
        html += `</ul></div></section>`
        return html
}

const genDistDir = () => {
        
}

const pipeline = () => {
        console.log("---START BUILDING---")
        
        console.log("1. Generate `directory` Json Array")
        const dir = genDirectoryJsonArray();
        console.log("DONE")

        console.log("2. Generate blog page")
        dir.push(createBlogPage(dir))
        console.log("DONE")
        
        console.log("3. Generate tags page")
        dir.push(createTopicsPage(dir))
        console.log("DONE")

        console.log("4. Append most recent post section to `home` page")
        dir.find(a => a.slug == "").html += createMostRecentSection(dir, numberOfMostRecentPost)
        console.log("DONE")

        console.log("--- Writing a file ---")
        // Delete /dist
        fs.rmSync(DIST, {recursive: true, force: true});
        // Create new /dist
        fs.mkdirSync('./dist/');
        fs.writeFileSync(path.join('./src/',DIRECTORY_DIR), JSON.stringify(dir));
        // Add Static Content (./src)
        fs.cpSync('./src', './dist/src/', { recursive: true});
        fs.cpSync('./public','./dist/public/', { recursive: true});
        fs.cpSync('index.html', './dist/index.html');
        console.log("DONE!");
}
        
pipeline()













