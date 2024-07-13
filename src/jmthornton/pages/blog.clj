(ns jmthornton.pages.blog
  (:require
   [hiccup.page :refer [html5]]
   [jmthornton.layout :refer [site-layout-page]]))

(defn index []
  {:title "Blog by Jade Michael Thornton"
   :description "A collection of thoughts by Jade Michael Thornton, a full stack senior software engineer"
   :content (html5 (slurp "resources/partials/blog/index.html"))
   :head-content (html5
                  [:link {:rel "stylesheet"
                          :type "text/css"
                          :href "/style/blog.css"}])})

(defn blog-pages [] {})

(defn blog-recipes [] {})

(defn all []
  (merge
   {"/blog/" (site-layout-page (index))}
   (blog-pages)
   (blog-recipes)))
