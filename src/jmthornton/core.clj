(ns jmthornton.core
  (:require [jmthornton.layout :refer [site-layout-page]]
            [jmthornton.pages.frontpage :refer [frontpage]]
            [stasis.core :as stasis]))

(defn get-pages []
  {"/" (site-layout-page (frontpage) "Jade Michael Thornton — Software Engineer")})

(def app (stasis/serve-pages get-pages))

(defn export []
  (let [target-dir "public"]
    (stasis/empty-directory! target-dir)
    (stasis/export-pages (get-pages) target-dir)))
