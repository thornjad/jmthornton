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
