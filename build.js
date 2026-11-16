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

// Delete /dist
fs.rmSync(DIST, {recursive: true, force: true});
// Create new /dist
fs.mkdirSync('./dist/pages/posts/', { recursive: true });

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
let postsListpageHTML = "<table>";

const dateFormat = 

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
    
    let htmlContent = marked(content);

    const dateStr = data.date.toISOString().split('T')[0];
    const rawTitle = data.title;
    const formattedTitle = rawTitle.toLowerCase().replace(/\s+/g, '-');
    const slug = `${dateStr}_${formattedTitle}`;

    validPosts.push({
        slug,
        title: data.title,
        date: data.date,
        tags: data.tags,
        description: data.description,
        htmlContent
    })
    // Craete Blog List Page
    postsListpageHTML += `
        <tr>
            <td>${</td>
            <td></td>
        </tr>
    `

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
    let htmlContent = marked(content);
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


validPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

const siteData = {
    "pages": validPages,
    "posts": validPosts
}

fs.writeFileSync(path.join('./src/',SITE_DATA_JSON), JSON.stringify(siteData));

// Add Static Content (./src)
fs.cpSync('./src', './dist/src/', { recursive: true});
fs.cpSync('./public','./dist/public/', { recursive: true});

console.log("DONE!");



