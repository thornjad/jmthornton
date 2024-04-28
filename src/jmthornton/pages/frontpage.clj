(ns jmthornton.pages.frontpage
  (:require [hiccup.page :refer [html5]]))

(defn frontpage-content []
  [:div "Hello world"])

(defn frontpage []
  {:title "Jade Michael Thornton — Software Engineer"
   :content (frontpage-content)})
