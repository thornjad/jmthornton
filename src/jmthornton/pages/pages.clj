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
