(ns jmthornton.core
  (:require [jmthornton.layout :refer [site-layout-page]]
            [jmthornton.pages.frontpage :refer [frontpage]]
            [optimus.assets :as assets]
            [optimus.export]
            [optimus.optimizations :as optimizations]
            [optimus.prime :as optimus]
            [optimus.strategies :refer [serve-live-assets]]
            [stasis.core :as stasis]))

(defn get-assets []
  (concat
   (assets/load-assets "public"
                       [#"/style/.+\.css"
                        #"/fonts/.+\.(woff2|woff)"
                        #"/images/.*"
                        #"/vendor/.*"])))

(defn get-pages []
  {"/" (site-layout-page (frontpage))})

(def app (->
          (stasis/serve-pages get-pages)
          (optimus/wrap get-assets optimizations/all serve-live-assets)))

(defn export []
  (let [assets (optimizations/all (get-assets) {})
        pages (get-pages)
        target-dir "dist"]
    (stasis/empty-directory! target-dir)
    (optimus.export/save-assets assets target-dir)
    (stasis/export-pages pages target-dir {:optimus-assets assets})))
