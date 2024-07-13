(ns jmthornton.pages.blog
  (:require
   [clojure.java.io :as io]
   [hiccup.page :refer [html5]]
   [jmthornton.layout :refer [site-layout-page]]
   [markdown.core :as md]))

(defn- index []
  {:title "Blog by Jade Michael Thornton"
   :description "A collection of thoughts by Jade Michael Thornton, a full stack senior software engineer"
   :head-content (html5
                  [:link {:rel "stylesheet"
                          :type "text/css"
                          :href "/style/blog.css"}])
   :content (html5
             [:main
              [:div {:class "no-md-a"}
               [:div.title.blog-title
                [:br]
                [:h1 "Blog" [:small " by " [:span.rgb-color "Jade Michael Thornton"]]]
                [:p [:small [:em "All opinions are my own and do not reflect the views of my past,
present nor future employers. Do not immerse this blog in water. Safety goggles recommended. Blog
titles ice before road. Danger: high voltage. Do not read odd-numbered posts during a snow
emergency. Keep out of reach of children. Not intended for highway use. Remove silica packet before
eating. This blog is known to the state of California to cause cancer. Do not use as a projectile in
a catapult; trebuchets are fine."]]]
                [:p
                 [:a {:href "./recipes/"} "Family Recipes"]
                 "&nbsp;|&nbsp;"
                 [:a {:href "./feed/jade.atom"} "Subscribe"]]
                [:br]]

               [:div.listing.sep-top]]])})

(defn- get-blog-page [path]
  (merge
   (md/md-to-html-string-with-meta
    (slurp (.getPath path))
    :reference-anchors? true
    :heading-anchors true
    :footnotes? true)

   {:file-name (.getName path)}))

(defn- get-all-blog-pages []
  (doseq [f (.listFiles (io/file "resources/writing/blog/"))]
    (let [html-string (get-blog-page f)
          metadata (:metadata html-string)]
      {:file-name (:file-name html-string)
       :title (:title metadata)
       :description (:description metadata)
       :content (:html html-string)})))

(defn- blog-pages []
  (into {} (map (fn [page]
                  {(str "/blog/p/" (:file-name page) "/") page})
                (get-all-blog-pages))))

(defn- blog-recipes [] {})

(defn all []
  (merge
   {"/blog/" (site-layout-page (index))}
   (blog-pages)
   (blog-recipes)))
