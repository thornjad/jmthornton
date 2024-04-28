(ns jmthornton.layout
  (:require [hiccup.page :refer [html5]]))

;; TODO optimus.link
(defn site-layout-page [& {:keys [title content head-content head-scripts]
                           :or {title "Jade Michael Thornton — Software Engineer"
                                content []
                                head-content []
                                head-scripts []}}]
  (html5
   [:html
    [:head {:lang "en-US"}
     [:meta {:charset "utf-8"}]
     [:meta {:name "google-site-verification"
             :content "JUM1Dl9n9ic9xPMb03Nzf4NgW_-8PWZrJ4eJGC_PoYM"}]
     [:title title]
     [:meta {:name "description"
             :content "Jade Michael Thornton is a senior software engineer and this is his website."}]

     [:meta {:name "robots"
             :content "home, follow"}]
     [:link {:rel "canonical"
             :href "https://jmthornton.net"}]
     [:link {:rel "shortcut icon"
             :href "/assets/images/favicon.png"}]

     [:link {:rel "prefetch"
             :href "/assets/style/main.css"
             :as "style"
             :crossorigin true}]

     [:link {:rel "prefetch"
             :href "/assets/fonts/MetroNova-Regular.woff2"
             :as "font"
             :type "font/woff2"
             :crossorigin "anonymous"}]
     [:link {:rel "prefetch"
             :href "/assets/fonts/MetroNova-Italic.woff2"
             :as "font"
             :type "font/woff2"
             :crossorigin "anonymous"}]
     [:link {:rel "prefetch"
             :href "/assets/fonts/MetroNova-Bold.woff2"
             :as "font"
             :type "font/woff2"
             :crossorigin "anonymous"}]
     [:link {:rel "prefetch"
             :href "/assets/fonts/MetroNova-BoldItalic.woff2"
             :as "font"
             :type "font/woff2"
             :crossorigin "anonymous"}]

     [:link {:rel "stylesheet"
             :href "/assets/style/main.css"
             :type "text/css"}]
     [:script {:async true
               :src "/lib/oneko.js"}]]

    [:body
     [:h1 "Dynamically inserted stuff"]
     content]]))
