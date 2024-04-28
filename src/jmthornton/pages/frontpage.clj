(ns jmthornton.pages.frontpage
  (:require [hiccup.page :refer [html5]]))

(defn frontpage []
  (html5
   [:div "Hello world"]))
