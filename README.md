# blkcipher.eth

Purpose: to share my thoughts on stuff. 

Technologies used:
- Jekyll
- No-style-please theme


```bash
bundle exec jekyll serve
```
or

```bash
`jekyll serve`
```



# Edit the main theme CSS
```bash
vim public/css/lanyon.css
```

# Or create a custom CSS file
```bash
vim public/css/custom.css
```

#To Update the Theme

## Update the submodule
```bash
git submodule update --remote themes/lanyon
```

## Update the gem
```bash
bundle update lanyon
```

## Copy any new public assets (if theme adds new ones)
```bash
cp -r themes/lanyon/public/* public/
```

## Project Structure

```
blkcipher.eth/
├── themes/lanyon/              # Git submodule (original theme)
│   ├── _layouts/
│   │   ├── default.html
│   │   ├── page.html
│   │   └── post.html
│   ├── _includes/
│   │   ├── head.html
│   │   └── sidebar.html
│   ├── public/
│   │   ├── css/
│   │   │   ├── lanyon.css
│   │   │   ├── poole.css
│   │   │   └── syntax.css
│   │   ├── js/
│   │   │   └── script.js
│   │   └── favicon.ico
│   └── lanyon.gemspec
├── _includes/
│   └── sidebar.html            # Custom sidebar override
├── _posts/
│   └── 2025-09-29-test.md     # Blog posts
├── public/                     # Theme assets (CSS, JS, images)
│   ├── css/
│   ├── js/
│   └── favicon.ico
├── _config.yml                 # Jekyll configuration (theme: lanyon)
├── Gemfile                     # Dependencies (lanyon gem + plugins)
├── index.markdown              # Homepage
└── README.md                   # This file
```

### Key Files

- **`_config.yml`** - Jekyll configuration with Lanyon theme
- **`Gemfile`** - Ruby dependencies including Lanyon theme gem
- **`themes/lanyon/`** - Git submodule containing original theme files
- **`_includes/sidebar.html`** - Custom sidebar override
- **`public/`** - Static assets (CSS, JS, images)