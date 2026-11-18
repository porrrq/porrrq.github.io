// This file is used for compile and prepare `innerHTML` element for each page
// Both `pages` element (e.g., about, blog list) and each `blog` element
// Each pages start with its title (h1)
// Each blog start with its title (h1) and time element
// The output is a dictionary with 2 keys including: pages and blogs
// both contains an array store all of its article type

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

const PAGE_DIR = "./pages/"
const CONTENT_DIR = './pages/posts/';
const DIST = './dist/';
const SITE_DATA_JSON = 'siteData.json';
const DIRECTORY_DIR = 'directory.json';

const directory = {};
const allTags = new Set();

// Delete /dist
fs.rmSync(DIST, {recursive: true, force: true});
// Create new /dist
fs.mkdirSync('./dist/');

const isFieldEmpty = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
};

// Processing posts
const posts = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));
const validPosts = [];
const invalidPosts = [];
const formatDate = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
})

posts.forEach(file => {
    const postPath = path.join(CONTENT_DIR,file);
    const postFile = fs.readFileSync(postPath, 'utf-8');
    const { data, content } = matter(postFile);

    const invalidFields = [];
    // Check Metadata    
    if (isFieldEmpty(data.title)) invalidFields.push('title');
    if (isFieldEmpty(data.description)) invalidFields.push('description');
    if (isFieldEmpty(data.date)) invalidFields.push('date');
    if (isFieldEmpty(data.tags)) invalidFields.push('tags');
    
    // No need to convert the content and create html
    if (invalidFields.length > 0 ) {
        invalidPosts.push({ file, invalidFields});
        return;
    }
    
    // sort tags
    data.tags.sort()

    let htmlContent = marked(content);
    const dateStr = data.date.toISOString().split('T')[0];
    const rawTitle = data.title;
    const formattedTitle = rawTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s]/gi, '');
    const slug = `${dateStr}_${formattedTitle}`;
    const formattedDate = formatDate.format(data.date).replace(/(\w{3}) (\d{4})$/, "$1, $2")
    
    // Creat `related section`
    let tags = "";
    data.tags.map(tag => {
        // Add tag to all tag list for `topics` pagge
        allTags.add(tag)
        // Create an element
        tags += `<span><a class="tag" href="#blog?tag=${tag}">${tag}</a> · </span>`
    })

    htmlContent = `<h1>${data.title}</h1><p><i><time datetime="${data.date}">${formattedDate}</time></i></p>` + 
                    htmlContent + 
                    `<div class="tagList">
                        Related <br>
                        ${tags.replace(/ · <\/span>$/,"</span>")}
                    </div>`
    htmlContent = `<div class="blogPost">${htmlContent}</div>`

    validPosts.push({
        slug,
        title: data.title,
        date: data.date,
        formattedDate: formattedDate,
        tags: data.tags,
        description: data.description,
        htmlContent
    })
    
})


if (invalidPosts.length > 0) {
    console.error('\n BUILD FIELD: Found invalid markdown metadata in the following files:');
    invalidPosts.forEach(item => {
        console.error(` + ${item.file} -> Missing fields: ${item.invalidFields}`);
    })
    console.error("\n Please fix the Frontmatter in these files before build again.\n");
    // Step the process (CI/CD in Codeberg show errors.)
    process.exit(1);
}

// Process Pages
const pages = fs.readdirSync(PAGE_DIR).filter(file => file.endsWith('.md'));
const validPages = [];
const invalidPages = [];
pages.forEach(file => {
    const pagePath = path.join(PAGE_DIR,file);
    const pageFile = fs.readFileSync(pagePath, 'utf-8');
    const { data, content } = matter(pageFile);

    const invalidFields = [];
    // Check Metadata    
    if (isFieldEmpty(data.title)) invalidFields.push('title');
    
    // No need to convert the content and create html
    if (invalidFields.length > 0 ) {
        invalidPages.push({ file, invalidFields});
        return;
    }
    let htmlContent = `<div class="${file.slice(0,-3)}-container"><h1>${data.title}</h1>` + marked(content) + `</div>`;
    const slug = file.toString().slice(0,-3);
    validPages.push({
        slug,
        title: data.title,
        description: data.description,
        htmlContent
    })
})

if (invalidPages.length > 0) {
    console.error('\n BUILD FIELD: Found invalid markdown metadata in the following files:');
    invalidPages.forEach(item => {
        console.error(` + ${item.file} -> Missing fields: ${item.invalidFields}`);
    })
    console.error("\n Please fix the Frontmatter in these files before build again.\n");
    // Step the process (CI/CD in Codeberg show errors.)
    process.exit(1);
}

// sort blog by date
validPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

// create sorted array of allTags
const sortedAllTags = [...allTags].sort();

// Create `most recent` and `blog post` list
let postsListpageHTML = "<div class='blog-posts-container'><ul class='blog-posts'>";
let mostRecentPostTable = "<section><h2>Most Recent Posts</h2><div class='most-recent-blog-posts-container'><ul class='blog-posts'>";

const loopMaxForMostRecent = 5;
let i = 0;
validPosts.forEach(post => {
    //append most recent
    const append = `<li class="data-tags">
        <span class="date"><i><time datetime="${post.date}">${post.formattedDate}</time></i></span>
        <span class="title"><a href="#${post.slug}">${post.title}</a></span>
    `;
    postsListpageHTML += append + `<span class="tags">`;
    if (i < loopMaxForMostRecent) {
        mostRecentPostTable += append + `</li>`;
        i++
    }
    
    post.tags.forEach(tag => {
        postsListpageHTML += `<a class="${tag}" href="#blog?tag=${tag}">${tag}</a>\n`
    })
    postsListpageHTML += `</span></li>`;
})
postsListpageHTML += '</div>'
mostRecentPostTable += '</div></section>'

validPages.push({
    slug: "blog",
    title: "blog",
    description: "blog",
    htmlContent: postsListpageHTML
})


// Append `most recent posts` section to home page
const homePage = validPages.find(page => page.slug == "home");
let homePageHTML = homePage.htmlContent;
homePageHTML += mostRecentPostTable;
homePage.htmlContent = homePageHTML;

// Create `topics` page
let topicHTML = `<div class="topic-list-container"><ul>`;
sortedAllTags.forEach( tag => {
    topicHTML += `<li class="topic"><a href="#blog?tag=${tag}">${tag}</a></li>`
})
topicHTML += `</ul></div>`;
// Push content
validPages.push({
    slug: "topic",
    title: "topic",
    description: "blog",
    htmlContent: topicHTML
})


const siteData = {
    "pages": validPages,
    "posts": validPosts
}

// Creating `directory` file
for (const [type, arr] of Object.entries(siteData)) {
    arr.map((dic, index) => {
        const slug = dic.slug
        directory[slug] = {
            "type": type,
            "index": index
        }
    })
}

fs.writeFileSync(path.join('./src/',SITE_DATA_JSON), JSON.stringify(siteData));
fs.writeFileSync(path.join('./src/',DIRECTORY_DIR), JSON.stringify(directory));

// Add Static Content (./src)
fs.cpSync('./src', './dist/src/', { recursive: true});
fs.cpSync('./public','./dist/public/', { recursive: true});
fs.cpSync('index.html', './dist/index.html');

console.log("DONE!");



