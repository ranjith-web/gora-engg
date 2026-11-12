#!/bin/sh
# Makes web-sized copies of any photo in public/drums-gallery that has none yet (macOS: uses sips).
#   thumb/ = up to 900px wide (marquee strip)   full/ = up to 1800px wide (expanded view)
# Then add the photo name (e.g. "proj-11") to GALLERY in src/features/site/data/content.js.
cd "$(dirname "$0")/../public/drums-gallery" || exit 1
mkdir -p thumb full
for f in *.png *.jpg *.jpeg; do
  [ -f "$f" ] || continue
  b="${f%.*}"
  [ -f "thumb/$b.jpg" ] && [ -f "full/$b.jpg" ] && continue
  w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
  tw=$(( w > 900 ? 900 : w )); fw=$(( w > 1800 ? 1800 : w ))
  sips -s format jpeg -s formatOptions 78 --resampleWidth "$tw" "$f" --out "thumb/$b.jpg" >/dev/null
  sips -s format jpeg -s formatOptions 82 --resampleWidth "$fw" "$f" --out "full/$b.jpg" >/dev/null
  echo "optimized $b"
done
