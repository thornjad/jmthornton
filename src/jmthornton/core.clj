(ns jmthornton.core
  (:require [clojure.java.io :as io]
            [hiccup.page :refer [html5]]
            [ring.util.response :refer [response]]
            [stasis.core :as stasis]))

(defn layout-page [page]
  (html5
   [:html
    [:head
     [:title "My new site"]
     [:link {:rel "stylesheet"
             :href "/assets/styles/main.css"}]]
    [:body
     [:h1 "Dynamically inserted stuff"]
     [:div.body page]]]))

(defn frontpage [context]
  (response
   (html5
    [:div "Hello world"])))

(defn get-pages []
  {"/" frontpage})

(def app (stasis/serve-pages get-pages))
