#!/bin/sh

set -eu

usage() {
  echo "Usage: $0 INPUT.mp4 OUTPUT.webp START_SECONDS SOURCE_DURATION_SECONDS" >&2
  exit 2
}

fail() {
  echo "build-mascot-atlas: $*" >&2
  exit 1
}

[ "$#" -eq 4 ] || usage

input=$1
output=$2
start_seconds=$3
duration_seconds=$4
normalized_duration=4.00

[ -f "$input" ] || fail "input video not found: $input"

awk -v value="$start_seconds" 'BEGIN {
  valid = value ~ /^([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  exit !(valid && value + 0 >= 0)
}' || fail "START_SECONDS must be a non-negative number"
awk -v value="$duration_seconds" 'BEGIN {
  valid = value ~ /^([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  exit !(valid && value + 0 > 0)
}' || fail "DURATION_SECONDS must be a positive number"

for required_tool in ffmpeg ffprobe awk find grep mktemp python3 wc; do
  command -v "$required_tool" >/dev/null 2>&1 || fail "required tool not found: $required_tool"
done

python3 - <<'PY'
from io import BytesIO

try:
    from PIL import Image, features
except ImportError as error:
    raise SystemExit(
        "build-mascot-atlas: Pillow is required for RGBA despill and WebP validation: "
        f"{error}"
    )

if not features.check("webp"):
    raise SystemExit("build-mascot-atlas: Pillow lacks WebP decode/encode support")

probe = BytesIO()
Image.new("RGBA", (1, 1), (12, 34, 56, 0)).save(
    probe, format="WEBP", quality=82, method=6
)
probe.seek(0)
with Image.open(probe) as decoded:
    if decoded.convert("RGBA").getpixel((0, 0))[3] != 0:
        raise SystemExit("build-mascot-atlas: Pillow WebP alpha round-trip failed")
PY

output_dir=$(dirname "$output")
mkdir -p "$output_dir"
temp_dir=$(mktemp -d "${TMPDIR:-/tmp}/paws-mascot-atlas.XXXXXX")
cleanup() {
  rm -rf -- "$temp_dir"
}
trap cleanup EXIT INT TERM

retime_factor=$(awk -v normalized="$normalized_duration" -v source="$duration_seconds" 'BEGIN { printf "%.6f", normalized / source }')

ffmpeg -v error \
  -ss "$start_seconds" \
  -i "$input" \
  -vf "trim=duration=${duration_seconds},setpts=(${normalized_duration}/${duration_seconds})*(PTS-STARTPTS),fps=6,chromakey=0x00ff00:0.18:0.08,scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba" \
  -frames:v 24 \
  "$temp_dir/frame-%02d.png"

frame_count=$(find "$temp_dir" -name 'frame-*.png' -type f | wc -l | tr -d ' ')
[ "$frame_count" -eq 24 ] || fail "expected 24 extracted frames, found $frame_count"

for frame in "$temp_dir"/frame-*.png; do
  frame_format=$(ffprobe -v error -select_streams v:0 -show_entries stream=pix_fmt -of default=noprint_wrappers=1:nokey=1 "$frame")
  [ "$frame_format" = "rgba" ] || fail "frame is missing RGBA pixels: $frame ($frame_format)"
done

despill_result=$(python3 - "$temp_dir" <<'PY'
from pathlib import Path
import sys

from PIL import Image

DESPILL_GREEN_DOMINANCE_THRESHOLD = 16
frame_directory = Path(sys.argv[1])
changed = 0

for frame_path in sorted(frame_directory.glob("frame-*.png")):
    with Image.open(frame_path) as source:
        image = source.convert("RGBA")

    cleaned = []
    for red, green, blue, alpha in image.getdata():
        if alpha == 0:
            cleaned.append((0, 0, 0, 0))
            continue

        neutral_anchor = max(red, blue)
        if green - neutral_anchor > DESPILL_GREEN_DOMINANCE_THRESHOLD:
            green = max(0, neutral_anchor - 1)
            changed += 1
        cleaned.append((red, green, blue, alpha))

    image.putdata(cleaned)
    image.save(frame_path, format="PNG", compress_level=9)

print(
    f"green_dominance_threshold={DESPILL_GREEN_DOMINANCE_THRESHOLD},"
    f"changed_pixels={changed}"
)
PY
)

temp_atlas_png="$temp_dir/mascot-turn-atlas.png"
ffmpeg -v error \
  -framerate 6 \
  -i "$temp_dir/frame-%02d.png" \
  -vf "tile=6x4:padding=0:margin=0,format=rgba" \
  -frames:v 1 \
  -c:v png \
  -compression_level 9 \
  "$temp_atlas_png"

temp_output="$temp_dir/mascot-turn-atlas.webp"
if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q '[[:space:]]libwebp[[:space:]]'; then
  ffmpeg -v error \
    -i "$temp_atlas_png" \
    -frames:v 1 \
    -c:v libwebp \
    -quality 82 \
    -compression_level 6 \
    -pix_fmt yuva420p \
    "$temp_output"
else
  command -v python3 >/dev/null 2>&1 || fail "WebP encoding needs ffmpeg libwebp or Python 3 with Pillow"
  python3 - "$temp_atlas_png" "$temp_output" <<'PY'
from pathlib import Path
import sys

try:
    from PIL import Image, features
except ImportError as error:
    raise SystemExit(f"build-mascot-atlas: Pillow is required for WebP fallback: {error}")

if not features.check("webp"):
    raise SystemExit("build-mascot-atlas: Pillow lacks WebP encoding support")

source = Path(sys.argv[1])
destination = Path(sys.argv[2])
with Image.open(source) as image:
    image.convert("RGBA").save(destination, format="WEBP", quality=82, method=6)
PY
fi

[ -s "$temp_output" ] || fail "atlas encoder produced an empty file"

atlas_metadata=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,pix_fmt -of csv=p=0 "$temp_output")
atlas_width=$(printf '%s\n' "$atlas_metadata" | awk -F, '{print $1}')
atlas_height=$(printf '%s\n' "$atlas_metadata" | awk -F, '{print $2}')
atlas_format=$(printf '%s\n' "$atlas_metadata" | awk -F, '{print $3}')
[ "$atlas_width" -eq 3072 ] && [ "$atlas_height" -eq 2048 ] || fail "unexpected atlas dimensions: ${atlas_width}x${atlas_height}"
case "$atlas_format" in
  *a*) ;;
  *) fail "atlas is missing alpha: $atlas_format" ;;
esac

alpha_counts=$(python3 - "$temp_output" <<'PY'
from PIL import Image
import sys

with Image.open(sys.argv[1]) as image:
    alpha = image.convert("RGBA").getchannel("A")
histogram = alpha.histogram()
transparent = histogram[0]
partial = sum(histogram[1:255])
opaque = histogram[255]
if not (transparent > 0 and partial > 0 and opaque > 0):
    raise SystemExit(
        "build-mascot-atlas: invalid alpha coverage "
        f"transparent={transparent} partial={partial} opaque={opaque}"
    )
print(f"transparent={transparent},partial={partial},opaque={opaque}")
PY
)

atlas_bytes=$(wc -c < "$temp_output" | tr -d ' ')
[ "$atlas_bytes" -le 3145728 ] || fail "atlas exceeds 3,145,728 bytes: $atlas_bytes"

mv "$temp_output" "$output"
echo "Built $output: source ${start_seconds}s+${duration_seconds}s, retime ${retime_factor}x to ${normalized_duration}s, 24 frames, 6x4, 512px cells, chromakey 0x00ff00:0.18:0.08, despill $despill_result, WebP quality 82, $alpha_counts, $atlas_bytes bytes"
