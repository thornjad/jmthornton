(defproject jmthornton "7.0.0-DEVEL"
  :description "Personal website of Jade Michael Thornton"
  :url "https://jmthornton.net"
  :license {:name "ISC"
            :url "https://jmthornton.net/LICENSE"}
  :dependencies [[org.clojure/clojure "1.11.2"]
                 [stasis "2023.11.21"]
                 [ring "1.12.0"]
                 [optimus "2023.11.21"]
                 [hiccup "1.0.5"]]
  :profiles {:dev {:plugins [[lein-ring "0.12.6"]
                             [dev.weavejester/lein-cljfmt "0.12.0"]]}}
  :aliases {"build-site" ["run" "-m" "jmthornton.core/export"]}
  :cljfmt {:load-config-file? true}
  :ring {:handler jmthornton.core/app})
