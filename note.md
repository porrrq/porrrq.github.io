# Methodology
## The Skeleton

This is how the published blog site would intentionaly work under the hoolds:

1. `index.html` have an `.app` div which will be repaced by the content determined by a hash path routing which handled by JavaScript
2. When a path change, Javascript would lookup `directory.json`, a dictionary which holds slug as a key, its info(including the html content and meta data like title, date, and description) as a value.
3. Then, replaced the `.app.innerHTML` with the html content

Therefore, the build script is required to create a `directory.json` from all written blogs and pages in `.md` or `.html` as a consequence.


## How to write a page


### Path
There are about 2 types of content in the web: **post** and page, a page that can be entered through navigation bar (e.g., home, about, archive, etc.). And the program must able to distinct these two type of content in order to behave properly (.e.g, able to show all blog post).

As a consequnce, I designed a path structure as follows:
```
/contents/
    /pages/
        page1.md
        page2.md
        ...
    /posts/
        post1.md
        post2.md
        ...
    /assets/
        img1.webp
        img2.webp
        ...
index.html
```

To avoid any path conflict, all of the referring just `../assets/image-name.webp`


## Build script anatomy

As mentioned, the objective of build script is a creating a function that writing a JSON file which serve as an `innerHTML` for `.app`. In addition, this build script is essentially a data pipeline script into which converts all files in a specific path to String

Considering the path structure above, obviously, it has one problem. As the blog site has to store or know all the blog was written, we still cannot distinct which one is blog which one is for non-blog.

