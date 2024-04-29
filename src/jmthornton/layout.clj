(ns jmthornton.layout
  (:require [hiccup.page :refer [html5]]))

(defn site-layout-page [& {:keys [title description content head-content head-scripts]
                           :or {title "Jade Michael Thornton — Software Engineer"
                                content [:p "Page has no content"]
                                head-content nil
                                head-scripts nil
                                description "Jade Michael Thornton is a senior software engineer and this is his website."}}]
  (html5
   [:html
    [:head {:lang "en-US"}
     [:meta {:charset "utf-8"}]
     [:meta {:name "google-site-verification"
             :content "JUM1Dl9n9ic9xPMb03Nzf4NgW_-8PWZrJ4eJGC_PoYM"}]
     [:title title]
     [:meta {:name "description"
             :content description}]

     [:link {:rel "prefetch"
             :href "/style/main.css"
             :as "style"
             :crossorigin true}]

     [:link {:rel "prefetch"
             :href "/fonts/MetroNova-Regular.woff2"
             :as "font"
             :type "font/woff2"
             :crossorigin "anonymous"}]
     [:link {:rel "prefetch"
             :href "/fonts/MetroNova-Italic.woff2"
             :as "font"
             :type "font/woff2"
             :crossorigin "anonymous"}]
     [:link {:rel "prefetch"
             :href "/fonts/MetroNova-Bold.woff2"
             :as "font"
             :type "font/woff2"
             :crossorigin "anonymous"}]
     [:link {:rel "prefetch"
             :href "/fonts/MetroNova-BoldItalic.woff2"
             :as "font"
             :type "font/woff2"
             :crossorigin "anonymous"}]

     (html5 head-content)

     [:link {:rel "stylesheet"
             :href "/style/main.css"
             :type "text/css"}]
     (html5 head-scripts)]

    [:body content]]))

(defn nav-header []
  (html5
   [:header
    [:nav
     [:a {:href "/"} "Home"]
     [:a {:href "/tools"} "Tools"]
     [:a {:href "/blog"} "Blog"]
     [:a {:href "https://photos.jmthornton.net"} "Photos"]]]))
