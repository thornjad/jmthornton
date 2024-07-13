Title: Org-roam: Automatically Set Node Created and Modified Dates | Blog | Jade Michael Thornton
Description: Enhancing Org-roam nodes with auto-updating created and modified properties.
Published: 2024-03-18

# Org-roam: Automatically Set Node Created and Modified Dates

[Org-roam](https://www.orgroam.com/) is an Emacs package for non-hierarchical note-taking, and it does a brilliant job at organizing these thoughts but does not include automatic timestamping. By default, Org-roam does include the creation timestamp in the file name, but that's not easily read by a human.

To add this generally useful information, I automatically add a `:created:` property when visiting a node if it doesn't already exist, and a `:modified:` property when saving a node. This way, I can see when a note was created and when it was last modified.

Note that the `:created:` property parses the timestamp from the filename and relies on Org-roam's default naming scheme. If you use a different naming scheme, you'll need to modify the `org-roam-extract-timestamp-from-filepath` function to match your scheme.

---

### Automating Creation Dates

```lisp
(defun org-roam-insert-created-property ()
  "Insert :created: property for an Org-roam node.

Does not override the property if it already exists.

Calculation of the creation date is based on the filename of the note,
and assumes the default Org-roam naming scheme."
  (interactive)
  (when (org-roam-file-p)
    ;; Don't update if the created property already exists
    (unless (org-entry-get (point-min) "created" t)
      (let ((creation-time (org-roam-extract-timestamp-from-filepath
                            (buffer-file-name))))
        ;; Don't error if the filename doesn't contain a timestamp
        (when creation-time
          (save-excursion
            ;; Ensure point is at the beginning of the buffer
            (goto-char (point-min))
            (org-set-property "created" creation-time)))))))
```

### Extracting Timestamps from Filenames

```lisp
(defun org-roam-extract-timestamp-from-filepath (filepath)
  "Extract timestamp from the Org-roam FILEPATH assuming it follows the default naming scheme."
  (let ((filename (file-name-nondirectory filepath)))
    (when (string-match "\\([0-9]\\{8\\}\\)\\([0-9]\\{4\\}\\)" filename)
      (let ((year (substring filename (match-beginning 1) (+ (match-beginning 1) 4)))
            (month (substring filename (+ (match-beginning 1) 4) (+ (match-beginning 1) 6)))
            (day (substring filename (+ (match-beginning 1) 6) (+ (match-beginning 1) 8)))
            (hour (substring filename (match-beginning 2) (+ (match-beginning 2) 2)))
            (minute (substring filename (+ (match-beginning 2) 2) (+ (match-beginning 2) 4))))
        (format "[%s-%s-%s %s:%s]" year month day hour minute)))))
```

### Keeping Modification Dates Current

```lisp
(defun org-roam-insert-modified-property ()
  "Update the :modified: property for an Org-roam node upon saving."
  (when (org-roam-file-p)
    (save-excursion
      ;; Ensure property is applied to the whole file
      (goto-char (point-min))
      (org-set-property
       "modified" (format-time-string "[%Y-%m-%d %a %H:%M]")))))
```

The integration of these functions into your Emacs and Org-roam config ensures that every note's origins and edits are easily accessible and readable. To make these actually run, I set them up to run on before-save. There may be better hooks for this, but Org-roam's own hooks make it kind of difficult in my own setup, so I take the more brute force approach and it works fine for me:

```lisp
(add-hook 'before-save-hook #'aero/org-roam-insert-created-property)
(add-hook 'before-save-hook #'org-roam-insert-modified-property)
```

Check out my [full Emacs configuration](https://github.com/thornjad/aero) if you'd like to see how else I bend Emacs to my will.
