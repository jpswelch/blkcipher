---
layout: home
---


  
  
#### thoughts on stuff:
{% for post in site.posts %}
  {{ post.date | date: "%Y-%m-%d" }} <a href="{{ post.url }}">{{ post.title }}</a>
{% endfor %}

#### recent projects

coming soon... 
<!-- {% for project in site.projects %}
  <a href="{{ project.url }}">{{ project.title }}</a>
{% endfor %} -->