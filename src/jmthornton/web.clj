(ns jmthornton.web
  (:require [stasis.core :as stasis]))

(defn get-pages []
  (stasis/slurp-directory "resources/public" #".*\.(html|css|js)$"))

(def app (stasis/serve-pages get-pages))
