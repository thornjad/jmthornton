(ns jmthornton.layout
  (:require [hiccup.page :refer [html5]]))

(defn get-version []
  (nth (read-string (slurp "project.clj")) 2 "ALPHA"))

(defn- current-year []
  (+ 1900 (.getYear (java.util.Date.))))

(defn site-layout-page [& {:keys [title description content head-content footer-content]
                           :or {title "Jade Michael Thornton — Software Engineer"
                                content [:p "Page has no content"]
                                head-content nil
                                footer-content nil
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
             :type "text/css"}]]

    [:body
     (html5 content)
     [:p
      [:span (list "Copyright © 2012-" (current-year) " Jade Michael Thornton, ")
       [:a {:href "https://jmthornton.net/LICENSE"} "ISC License"]
       " | "
       [:a {:href "https://jmthornton.net"} "Home"]
       " | "
       [:a {:href "https://github.com/thornjad/jmthornton"} "Browse the source"]
       " | Version " (get-version)]
      (html5 footer-content)]]]))

(defn nav-header []
  (html5
   [:header
    [:nav
     [:a {:href "/"} "Home"]
     "&nbsp;"
     [:a {:href "/tools"} "Tools"]
     "&nbsp;"
     [:a {:href "https://blog.jmthornton.net"} "Blog"]
     "&nbsp;"
     [:a {:href "https://photos.jmthornton.net"} "Photos"]]]))
