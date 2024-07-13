(ns jmthornton.layout
  (:require
   [clojure.string :as string]
   [hiccup.page :refer [html5]]))

(defn get-version []
  (nth (read-string (slurp "project.clj")) 2 "ALPHA"))

(defn- current-year []
  (+ 1900 (.getYear (java.util.Date.))))

(defn site-layout-page [& {:keys [title title-crumbs description content head-content footer-content nav-section]
                           :or {title "Jade Michael Thornton"
                                title-crumbs nil
                                content [:p "Page exists but has no content"]
                                head-content nil
                                footer-content nil
                                description "Jade Michael Thornton is a senior software engineer and this is his website."
                                nav-section true}}]
  (let [title (if title-crumbs
                (str (string/join " | " title-crumbs) " | " title)
                title)]
    (html5
     [:html
      [:head {:lang "en-US"}
       [:meta {:charset "utf-8"}]
       [:meta {:name "google-site-verification"
               :content "JUM1Dl9n9ic9xPMb03Nzf4NgW_-8PWZrJ4eJGC_PoYM"}]
       [:meta {:name "made-with"
               :content "love"}]
       [:title title]
       [:meta {:name "description"
               :content description}]

       [:link {:rel "shortcut icon"
               :href "/images/favicon.png"}]

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

       [:link {:rel "stylesheet"
               :href "/style/main.css"
               :type "text/css"}]

       (html5 head-content)]

      [:body
       (when nav-section
         [:header
          [:nav
           [:a {:href "/"} "Home"]
           "&nbsp;"
           [:a {:href "/tools"} "Tools"]
           "&nbsp;"
           [:a {:href "/blog"} "Blog"]
           "&nbsp;"
           [:a {:href "/photos"} "Photos"]]])

      ;; main content
       (html5 content)

       [:p
        [:span (list "Copyright © 2012-" (current-year) " Jade Michael Thornton")
         "  |  "
         [:a {:href "https://jmthornton.net"} "Home"]
         "  |  "
         [:a {:href "https://github.com/thornjad/jmthornton"} "Browse the source"]
         "  |  Version " (get-version)]

        (html5 footer-content)]]])))
