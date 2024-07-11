(ns jmthornton.pages.pages
  (:require [hiccup.page :refer [html5]]
            [jmthornton.layout :as layout]))

(defn frontpage []
  {:title "Jade Michael Thornton — Software Engineer"
   :content (html5
             (layout/nav-header)
             (slurp "resources/partials/frontpage.html"))
   :head-content (html5
                  [:meta {:name "robots"
                          :content "home, follow"}]
                  [:script {:async true
                            :src "/lib/oneko.js"}])})

(defn tools []
  {:title "Tools | Jade Michael Thornton"
   :content (html5
             (layout/nav-header)
             (slurp "resources/partials/tools.html"))
   :head-content (html5
                  [:meta {:name "robots"
                          :content "noindex"}])})

(defn news []
  {:title "News | Jade Michael Thornton"
   :content (html5
             (layout/nav-header)
             (slurp "resources/partials/news.html"))
   :head-content (html5
                  [:meta {:name "robots"
                          :content "noindex"}]
                  [:style {:type "text/css"
                           :href "/style/news.css"}]
                  [:script {:defer true
                            :src "/lib/news.js"}])
   :footer-content (html5
                    [:p "Built by Jade Michael Thornton, powered by "
                     [:a {:href "https://news.ycombinator.com"} "YCombinator News"]])})
