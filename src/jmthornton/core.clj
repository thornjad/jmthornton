(ns jmthornton.core
  (:require [hiccup.page :refer [html5]]
            [stasis.core :as stasis]))

(defn frontpage [context]
  (html5
   [:div "Hello world"]))

(defn get-pages []
  {"/" frontpage})

(def app (stasis/serve-pages get-pages))

(defn export []
  (let [target-dir "public"]
    (stasis/empty-directory! target-dir)
    (stasis/export-pages (get-pages) target-dir)))
