(ns jmthornton.core
  (:require [clojure.java.io :as io]
            [hiccup2.core :refer [html]]
            [stasis.core :as stasis]))

(defn layout-page [page]
  (html
   [:html
    [:head
     [:title "My new site"]
     [:link {:rel "stylesheet"
             :href "/assets/styles/main.css"}]]
    [:body
     [:h1 "Dynamically inserted stuff"]
     [:div.body page]]]))

(defn about-page [request]
  (layout-page (slurp (io/resource "partials/about.html"))))

;; App

(defn get-pages []
  (merge (stasis/slurp-directory "resources/public" #".*\.(html|css|js)$")
         {"/about/" about-page}))

(def app (stasis/serve-pages get-pages))
