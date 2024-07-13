(ns jmthornton.core
  (:require
   [jmthornton.layout :refer [site-layout-page]]
   [jmthornton.pages.blog :as blog]
   [jmthornton.pages.pages :as pages]
   [optimus.assets :as assets]
   [optimus.export]
   [optimus.optimizations :as optimizations]
   [optimus.prime :as optimus]
   [optimus.strategies :refer [serve-live-assets]]
   [stasis.core :as stasis]))

;; TODO make sure js mime type is right for export
(defn get-assets []
  (concat
   (assets/load-assets "public"
                       [#"/style/.+\.css"
                        #"/fonts/.+\.(woff2|woff)"
                        #"/images/.*"
                        #"/lib/.+\.js"
                        #"/data/.*"])))

;; TODO double check each page
;; TODO subdomains? make sure that's still working
;; TODO slurp pages like LICENSE etc.
;; TODO slurp htaccess
;; TODO redirect subdomains back
(defn get-pages []
  {"/" (site-layout-page (pages/frontpage))

   ;; blog
   "/blog/" (site-layout-page (blog/index))

   ;; tools
   "/tools/" (site-layout-page (pages/tools))
   "/tools/news/" (site-layout-page (pages/news))
   "/tools/dencode/" (site-layout-page (pages/dencode))
   "/tools/jwt/" (site-layout-page (pages/jwt))
   "/tools/sponge/" (site-layout-page (pages/sponge))
   "/tools/query-dumper/" (site-layout-page (pages/query-dumper))
   "/tools/savings-transfer/" (site-layout-page (pages/savings-transfer))

   ;; zoo
   "/tools/libertarian-zoo/2020/" (site-layout-page (pages/zoo-2020))
   "/tools/libertarian-zoo/2024/" (site-layout-page (pages/zoo-2024))})

(def app (->
          (stasis/serve-pages get-pages)
          (optimus/wrap
           get-assets optimizations/none serve-live-assets
           {:uglify-js {:mangle-names true
                        :transpile-es6? true}})))

(defn export []
  (let [assets (optimizations/all (get-assets) {})
        pages (get-pages)
        target-dir "dist"]
    (stasis/empty-directory! target-dir)
    (optimus.export/save-assets assets target-dir)
    (stasis/export-pages pages target-dir {:optimus-assets assets})))
