(ns jmthornton.pages.frontpage
  (:require [hiccup.page :refer [html5]]
            [jmthornton.layout :as layout]))

(defn frontpage-content []
  (html5
   (layout/nav-header)
   [:main
    [:h1 {:class "rgb-color"
          :style "text-align: center;"} "Jade Michael Thornton"]
    [:section
     [:div {:class "split"}
      [:div {:class "left"}
       [:p "Hi there!"]
       [:p
        "I'm a software engineer, hobby aerial photographer and RC flight enthusiast. I know some things about some software, and a lot about taking care of house rabbits. My favorite language is Clojure, but I never get to work in it. I'm currently a senior software engineer and team lead at " [:a {:href "https://dronedeploy.com"} "DroneDeploy"] ", working on orthographic maps generated from 360 video captures, as well as unification with a recently-acquired startup."]
       [:p
        "I've previously worked and studied at " [:a {:href "https://flightaware.com"} "FlightAware"] " (a "
        [:a {:href "https://www.collinsaerospace.com"} "Collins Aerospace"] " company), "
        [:a {:href "https://www.thomsonreuters.com"} "Thomson Reuters"] ", "
        [:a {:href "https://www.mavericksoftware.com"} "Maverick Software"] ", the "
        [:a {:href "https://www.hhh.umn.edu"} "Humphrey School of Public Affairs"] ", the "
        [:a {:href "https://www.umn.edu"} "University of Minnesota"] " and "
        [:a {:href "https://www.saintpaul.edu"} "Saint Paul College"] "."]
       [:p
        "Some other links include: my " [:a {:href "https://github.com/thornjad"} "GitHub"] " and "
        [:a {:href "https://gitlab.com/thornjad"} "GitLab"] " profiles, my "
        [:a {:href "https://blog.jmthornton.net"} "blog posts"] ", some "
        [:a {:href "/tools"} "online tools"] ", my "
        [:a {:href "https://linkedin.com/in/jademichael"} "LinkedIn profile"] ", and some "
        [:a {:href "https://photos.jmthornton.net"} "photos I took"] "."]
       [:p "Memento mori."]
       [:noscript
        [:p
         "Javascript disabled? Dope, I like you. The only JS on this page animates a little cat sprite that follows your cursor, and a little snippet that grabs the current site version number. So you're not missing much. Blog posts also use JS for code block syntax highlighting. Some tools pages need JS to work, but those should be pretty obvious."]]]
      [:div {:class "right"}
       [:img {:class "stephpic"
              :loading "lazy"
              :src "/images/stephandjade.webp"
              :title "And of course this site runs on love"}]]]]
    [:section
     [:h2 "My Projects"]
     [:blockquote
      "What I cannot create, I do not understand"
      [:figcaption "&mdash; Richard Feynman"]]
     [:p
      "All of my projects are open source and live on"
      [:a {:href "https://gitlab.com/thornjad"} "GitLab"] " and/or"
      [:a {:href "https://github.com/thornjad"} "GitHub"] ". Here's some of my favorite highlights."]
     [:ul {:class "dl"}
      [:li
       [:p "Emacs tools and configuration"]
       [:p
        "I use Emacs every day and love it, and I've put care and effort into crafting my development environment to a high level of productivity. Besides my refined " [:a {:href "https://gitlab.com/thornjad/aero"} "Emacs configuration"] ", I authored several packages such as " [:a {:href "https://gitlab.com/thornjad/el2md"} "el2md"] ", " [:a {:href "https://gitlab.com/thornjad/rivet-mode"} "Rivet mode"] " and several more."]]
      [:li
       [:p "http-server and its dependencies"]
       [:p
        "I've been the de facto lead developer of " [:a {:href "https://github.com/http-party/http-server"} "http-server"] " for a while, though it unfortunately takes a back seat to my career and the rest of my life. I'm also a contributor to its dependencies, including " [:a {:href "https://github.com/flatiron/union"} "union"] " and " [:a {:href "https://github.com/http-party/node-http-proxy"} "http-proxy"] "."]]
      [:li
       [:p "Themes and more themes"]
       [:p
        "I have a desire for everything I use to look good and work well. To that end, I often create or
contribute to themes of various types, including"
        [:a {:href "https://gitlab.com/thornjad/aero-theme"} "Aero"] " (Emacs), "
        [:a {:href "https://gitlab.com/thornjad/vero"} "Vero"] " (Zsh), "
        [:a {:href "https://github.com/ClearNight"} "ClearNight"] " (Atom, RIP) and"
        [:a {:href "https://github.com/thornjad/unbroken"} "Unbroken"] " (GTK3). I was also part of the
creation of the " [:a {:href "https://minicss.org/"} "mini.css"] " framework."]
       [:p "This site's design is based on my Aero Emacs theme."]]
      [:li
       [:p "Languages"]
       [:p
        "I have a penchant for esoteric languages and the lessons of language design they provide. I maintain and have made minor contributions to " [:a {:href "https://gitlab.com/orsonlang/orson"} "Orson"] ", which was created by " [:a {:href "https://cse.umn.edu/cs/james-moen"} "James Moen"] "."]
       [:p
        "I've also explored writing my own languages, though I've never completed one. Some of my half languages include " [:a {:href "https://gitlab.com/thornjad/warbler"} "Warbler"] ", " [:a {:href "https://gitlab.com/thornjad/brewlisp"} "Brewlisp"] " and " [:a {:href "https://gitlab.com/thornjad/spider-lang"} "Spider"] "."]]
      [:li
       [:p "Tools and utilities"]
       [:p
        "I authored " [:a {:href "https://gitlab.com/thornjad/zpico"} "Zpico"] " (a tiny Zsh plugin manager) and I always look out for more opportunities. Though I haven't published it in it's own package, my Aero Emacs configuration " [:a {:href "https://github.com/thornjad/aero/blob/main/lib/localpackages/aero-assistant/"} "contains a GPT Assistant mode"] "."]]
      [:li
       [:p "Education"]
       [:p
        "I enjoy teaching and mentoring new developers, and I have contributed to both"
        [:a {:href "https://www.freecodecamp.org"} "FreeCodeCamp lessons"] " and"
        [:a {:href "https://learnxinyminutes.com/"} "Learn X in Y minutes"] "."]]
      [:li
       [:p "Other contributions"]
       [:p
        "Falling into the \"other\" category, I'm one of the authors of"
        [:a {:href "https://github.com/remotestorage/armadietto"} "Armadietto"] " (a reference RemoteStorage
server) and a contributor to " [:a {:href "https://github.com/jkk/formative"} "Formative"] " (a Clojure
web form renderer), " [:a {:href "https://github.com/alacritty/alacritty"} "Alacritty"] " (a terminal
emulator), " [:a {:href "https://brave.com/"} " Brave Browser"] " (prior to the 1.0 release),"
        [:a {:href "https://github.com/flightaware/tohil"} "Tohil"] " (a TCL-Python integration library) and"
        [:a {:href "https://github.com/zplug/zplug"} "Zplug"] " (a Zsh plugin manager)."]]]]
    [:section
     [:div {:class "counter"}
      "You're visitor number&nbsp;"
      [:a {:class "no-a"
           :href "https://www.digits.net"}
       [:img {:src "https://counter.digits.net/?counter={845c7cdd-4df6-3514-a986-60ffa7b1cba4}&template=simple"
              :alt "Hit Counter by Digits"
              :border "0"}]]
      " according to " [:a {:href "https://www.digits.net"} "digits.net"]]
     [:div {:class "shield-links"}
      [:a {:href "https://gitlab.com/thornjad"}
       [:img {:alt "GitLab"
              :src "/images/shields/gitlab.svg"
              :loading "lazy"}]]
      [:a {:href "https://github.com/thornjad"}
       [:img {:alt "GitHub"
              :src "/images/shields/github.svg"
              :loading "lazy"}]]
      [:a {:href "https://www.linkedin.com/in/jademichael/"}
       [:img {:alt "LinkedIn"
              :src "/images/shields/linkedin.svg"
              :loading "lazy"}]]
      [:a {:href "https://wellfound.com/u/jade-thornton-1"}
       [:img {:alt "Wellfound"
              :src "/images/shields/angellist.svg"
              :loading "lazy"}]]
      [:a {:href "https://photos.jmthornton.net"}
       [:img {:alt "Flickr"
              :title "It's just my photos"
              :src "/images/shields/flickr.svg"
              :loading "lazy"}]]
      [:a {:href "https://github.com/thornjad/aero"}
       [:img {:alt "Created with Emacs"
              :src "/images/created-emacs.jpg"
              :loading "lazy"}]]
      [:img {:alt "Piracy now"
             :title "Piracy is swag"
             :src "/images/piracy.gif"
             :loading "lazy"}]
      [:a {:href "https://yesterweb.org/no-to-web3"}
       [:img {:src "/images/noweb3.gif"
              :alt "Keep the web free, Say no to Web3"}]]
      [:img {:alt "Learn HTML today!"
             :src "/images/html.gif"
             :loading "lazy"}]
      [:img {:alt "Best viewed with any browser"
             :src "/images/anybrow.gif"
             :loading "lazy"}]
      [:a {:href "https://yesterweb.org"}
       [:img {:src "/images/yesterweb.png"
              :alt "Yesterweb: reclaim the net"}]]]]]))

(defn frontpage []
  {:title "Jade Michael Thornton — Software Engineer"
   :content (frontpage-content)
   :head-content (html5
                  [:meta {:name "robots"
                          :content "home, follow"}]
                  [:link {:rel "canonical"
                          :href "https://jmthornton.net"}]
                  [:link {:rel "shortcut icon"
                          :href "/images/favicon.png"}])
   :head-scripts (html5
                  [:script {:async true
                            :src "/lib/oneko.js"}])})
