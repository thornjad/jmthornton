(ns jmthornton.pages.pages
  (:require [hiccup.page :refer [html5]]))

(defn frontpage []
  {:title "Jade Michael Thornton — Software Engineer"
   :content (html5 (slurp "resources/partials/frontpage.html"))
   :head-content (html5
                  [:meta {:name "robots"
                          :content "home, follow"}]
                  [:script {:async true
                            :src "/lib/oneko.js"}])})

(defn tools []
  {:title-crumbs ["Tools"]
   :content (html5 (slurp "resources/partials/tools.html"))
   :description "Tools and various projects by Jade Michael Thornton"
   :head-content (html5
                  [:meta {:name "robots"
                          :content "noindex"}])})

(defn news []
  {:title-crumbs ["News"]
   :description "News from the software realm"
   :content (html5 (slurp "resources/partials/news.html"))
   :head-content (html5
                  [:meta {:name "robots"
                          :content "noindex"}]
                  [:link {:rel "stylesheet"
                          :type "text/css"
                          :href "/style/news.css"}]
                  [:script {:defer true
                            :src "/lib/news.js"}])
   :footer-content (html5
                    [:p "Built by Jade Michael Thornton, powered by "
                     [:a {:href "https://news.ycombinator.com"} "YCombinator News"]])})

(defn dencode []
  {:title-crumbs ["URL Encode/Decode" "Tools"]
   :description "Easily and quickly encode and decode URL strings online for free"
   :content (html5 (slurp "resources/partials/dencode.html"))})

(defn jwt []
  {:title-crumbs ["JWT Decode" "Tools"]
   :description "Simply decode JWT tokens"
   :content (html5 (slurp "resources/partials/jwt.html"))})

(defn sponge []
  {:title-crumbs ["Sponge Text Generator" "Tools"]
   :description "EaSiLy gEnErAtE SpOnGe tExT"
   :content (html5 (slurp "resources/partials/sponge.html"))})

(defn query-dumper []
  {:title-crumbs ["Query Parameter Dumper" "Tools"]
   :description "Send query parameters and see how they parse"
   :content (html5 (slurp "resources/partials/query-dumper.html"))})

(defn savings-transfer []
  {:title-crumbs ["Savings Transfer Calculator" "Tools"]
   :description "Simple savings account transfer calculator"
   :content (html5 (slurp "resources/partials/savings-transfer.html"))
   :head-content (html5
                  [:link {:rel "stylesheet"
                          :type "text/css"
                          :href "/style/savings-transfer.html"}]
                  [:script {:defer true
                            :src "/lib/savings-transfer.js"}])})

(defn zoo-2020 []
  {:title "Libertarian Zoo 2020"
   :description "A complete zoo of Libertarian candidates for US president in 2020"
   :content (html5 (slurp "resources/partials/zoo/2020.html"))
   :head-content (html5
                  [:link {:rel "stylesheet"
                          :type "text/css"
                          :href "/style/zoo.css"}]
                  [:meta {:property "article:published_time"
                          :content "2020-05-18"}])})

(defn zoo-2024 []
  {:title "Libertarian Zoo 2024"
   :description "A complete zoo of Libertarian candidates for US president in 2024"
   :content (html5 (slurp "resources/partials/zoo/2024.html"))
   :head-content (html5
                  [:link {:rel "stylesheet"
                          :type "text/css"
                          :href "/style/zoo.css"}]
                  [:meta {:property "article:published_time"
                          :content "2024-01-22"}])
   :footer-content (html5
                    [:script {:async true
                              :src "/lib/zoo.js"}])})

(defn resume []
  {:title-crumbs ["Resume"]
   :description "Jade Michael Thornton is a senior software engineer and this is his resume."
   :content (html5 (slurp "resources/partials/resume.html"))
   :head-content (html5
                  [:link {:rel "stylesheet"
                          :type "text/css"
                          :href "/style/resume.css"}])})

(defn weather []
  {:title-crumbs ["Weather"]
   :description "Wind map and weather provided by Windy through Jade Thornton"
   :head-content (html5
                  [:link {:rel "stylesheet"
                          :type "text/css"
                          :href "/style/weather.css"}])
   :content (html5 [:div
                    [:h1 "Weather JMThornton.net"]
                    [:div.show-on-mobile
                     [:p "This project is not optimized for small screens."]]
                    [:noscript "This page requires Javascript"]
                    [:iframe
                     {:src "https://embed.windy.com/embed2.html?lat=39.011&lon=-75.256&detailLat=40.513&detailLon=-74.620&width=650&height=450&zoom=6&level=surface&overlay=radar&product=radar&menu=&message=true&marker=&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1"
                      :width 650
                      :height 450
                      :frameborder "0"
                      :referrerpolicy "no-referrer"}]])})

(defn every-city []
  {:title-crumbs ["Every city I've been to"]
   :description "A basic map showing every city I've ever been to, at least to my own memory."
   :content (html5
             [:iframe {:src "https://www.google.com/maps/d/u/0/embed?mid=1Mg5rPq4u03WqQnuHxvSxTyrr_k-1XbkB&ehbc=2E312F"
                       :width "640"
                       :height "480"
                       :frameborder "0"
                       :referrerpolicy "no-referrer"}])
   :head-content (html5
                  [:link {:rel "stylesheet"
                          :type "text/css"
                          :href "/style/every-city.css"}])})
