import posts from './posts.json' with { type: 'json'};

let html = "<table><tbody>"
posts.forEach(post => {
    const date = new Date(post.date);
    const formatDate = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })

   html += `<tr><td>${formatDate.format(date).replace(/(\w{3}) (\d{4})$/, "$1, $2")}</td><td>${post.title}</td></tr>`;
}) 
html += "</tbody></table>"
document.getElementById("app").innerHTML= html;

const metaDescription = document.querySelector('meta[name="description');

const route = async () => {
    const URL = window.location.pathname.slice(1);
    const contentFile = index[URL] || index["404"];
    const { data: frontmatter, content: markdownContent } = grayMatter(contentFile);

    // Convert content to HTML
    const htmlContent = marked.parse(htmlContent);
    
    // Set Meta Data
    document.title = frontmatter.title || "Untitiled Page";
    metaDescription.setAttribute("content", frontmatter.description);

    // Replace HTML
}

// window.onpopstate = route;