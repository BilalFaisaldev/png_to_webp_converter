import os
from PIL import Image, ImageDraw, ImageFont

def generate_logo():
    # Define sizes
    size = (512, 512)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Rounded Card
    # Smooth gradient from Indigo (#4F46E5) to Teal (#0D9488)
    for y in range(size[1]):
        # Calculate color interpolation
        r = int(0x4F + (0x0D - 0x4F) * (y / size[1]))
        g = int(0x46 + (0x94 - 0x46) * (y / size[1]))
        b = int(0xE5 + (0x88 - 0xE5) * (y / size[1]))
        
        # Draw horizontal line with rounded clipping
        # For simplicity, we draw the full gradient and then overlay a rounded mask
        for x in range(size[0]):
            # Rounded corner calculation
            # Card bounds: left=24, top=24, right=488, bottom=488 (radius=64)
            rx, ry = x - 256, y - 256
            # We will use an alpha mask for rounded corners
            pass

    # Let's use a cleaner method: Create a mask image for the rounded rectangle
    mask = Image.new("L", size, 0)
    mask_draw = ImageDraw.Draw(mask)
    # Draw rounded rectangle on mask
    mask_draw.rounded_rectangle([24, 24, 488, 488], radius=80, fill=255)

    # Create gradient image
    gradient = Image.new("RGBA", size)
    g_draw = ImageDraw.Draw(gradient)
    for y in range(size[1]):
        # Gradient colors: Slate-900 (#0f172a) to Slate-850 (#1e293b)
        # With a subtle indigo tint at the top and cyan tint at the bottom
        factor = y / size[1]
        r = int(15 + (30 - 15) * factor)
        g = int(23 + (41 - 23) * factor)
        b = int(42 + (59 - 42) * factor)
        for x in range(size[0]):
            gradient.putpixel((x, y), (r, g, b, 255))

    # Apply rounded mask to gradient background
    background = Image.new("RGBA", size, (0, 0, 0, 0))
    background.paste(gradient, (0, 0), mask)

    # Draw border around the card
    draw_bg = ImageDraw.Draw(background)
    draw_bg.rounded_rectangle([24, 24, 488, 488], radius=80, outline=(99, 102, 241, 255), width=10) # Indigo border

    # Draw graphic in the center
    # Left file card (PNG)
    left_card_mask = Image.new("L", size, 0)
    l_draw = ImageDraw.Draw(left_card_mask)
    l_draw.rounded_rectangle([90, 150, 230, 350], radius=24, fill=255)
    
    left_card = Image.new("RGBA", size, (79, 70, 229, 255)) # Indigo (#4f46e5)
    background.paste(left_card, (0, 0), left_card_mask)

    # Right file card (WEBP)
    right_card_mask = Image.new("L", size, 0)
    r_draw = ImageDraw.Draw(right_card_mask)
    r_draw.rounded_rectangle([282, 150, 422, 350], radius=24, fill=255)
    
    right_card = Image.new("RGBA", size, (13, 148, 136, 255)) # Teal (#0d9488)
    background.paste(right_card, (0, 0), right_card_mask)

    # Add labels on the cards
    # Use default font since it is guaranteed to be available, or draw letters manually
    # Let's draw text if possible, fallback to custom graphics
    draw_fg = ImageDraw.Draw(background)
    
    try:
        # Try to load a standard system font
        # Windows standard font paths
        font_paths = [
            "C:\\Windows\\Fonts\\arialbd.ttf",
            "C:\\Windows\\Fonts\\segoeuib.ttf",
            "C:\\Windows\\Fonts\\tahomabd.ttf"
        ]
        font = None
        for path in font_paths:
            if os.path.exists(path):
                font = ImageFont.truetype(path, 32)
                break
        if not font:
            font = ImageFont.load_default()
    except Exception:
        font = ImageFont.load_default()

    # Draw "PNG" on left card
    draw_fg.text((160, 250), "PNG", fill=(255, 255, 255, 255), anchor="mm", font=font)
    
    # Draw "WEBP" on right card
    draw_fg.text((352, 250), "WEBP", fill=(255, 255, 255, 255), anchor="mm", font=font)

    # Draw a stylized arrow in the middle
    # We will draw a white arrow polygon pointing from left to right
    # Arrow tail: 210, 240 -> 290, 240
    # Arrow head: 270, 220 -> 310, 250 -> 270, 280
    arrow_color = (255, 255, 255, 230)
    draw_fg.polygon([(230, 242), (270, 242), (270, 230), (300, 250), (270, 270), (270, 258), (230, 258)], fill=arrow_color)

    # Save outputs
    assets_dir = os.path.join(os.path.dirname(__file__), "assets")
    os.makedirs(assets_dir, exist_ok=True)

    png_path = os.path.join(assets_dir, "logo.png")
    ico_path = os.path.join(assets_dir, "logo.ico")

    background.save(png_path, "PNG")
    
    # Generate .ico with multiple standard sizes
    icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icon_images = []
    for s in icon_sizes:
        icon_images.append(background.resize(s, Image.Resampling.LANCZOS))
    
    background.save(ico_path, format="ICO", sizes=icon_sizes, append_images=icon_images)
    print(f"Generated logo.png and logo.ico in {assets_dir}")

if __name__ == "__main__":
    generate_logo()
