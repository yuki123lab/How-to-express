from PIL import Image, ImageDraw, ImageFont
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.dirname(BASE_DIR)
ICONS_DIR = os.path.join(PUBLIC_DIR, "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

BG_COLOR = "#0f0f11"
TEXT_COLOR = "#d4a853"
TEXT = "E"

def create_icon(size):
    img = Image.new("RGB", (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Try to load a bold font, fallback to default
    font_size = int(size * 0.55)
    font = None
    for candidate in [
        "arialbd.ttf",
        "Arial Bold.ttf",
        "DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
    ]:
        try:
            font = ImageFont.truetype(candidate, font_size)
            break
        except Exception:
            continue
    if font is None:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), TEXT, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) / 2 - bbox[0]
    y = (size - text_height) / 2 - bbox[1]

    draw.text((x, y), TEXT, fill=TEXT_COLOR, font=font)
    return img

# Generate standard icons
for name, size in [("icon-192x192.png", 192), ("icon-512x512.png", 512)]:
    icon = create_icon(size)
    icon.save(os.path.join(ICONS_DIR, name), "PNG")
    print(f"Generated {name}")

# Generate favicon (32x32) and apple touch icon (180x180)
favicon = create_icon(32)
favicon.save(os.path.join(PUBLIC_DIR, "favicon.ico"), format="ICO", sizes=[(32, 32)])
print("Generated favicon.ico")

apple = create_icon(180)
apple.save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), "PNG")
print("Generated apple-touch-icon.png")

print("Done")
