import os
import time
from PIL import Image

def scan_directory(directory_path):
    """
    Recursively scan the directory and return all supported image files (case-insensitive).
    """
    image_files = []
    if not os.path.isdir(directory_path):
        return image_files

    supported_extensions = ('.png', '.jpg', '.jpeg', '.bmp', '.tiff')
    for root, _, files in os.walk(directory_path):
        for file in files:
            if file.lower().endswith(supported_extensions):
                image_files.append(os.path.abspath(os.path.join(root, file)))
    return image_files

def get_image_metadata(file_path):
    """
    Safely get the dimensions and size of a PNG image.
    Uses PIL Image.open to read headers only, which is memory-efficient.
    Returns: (width, height, file_size_in_bytes) or (None, None, file_size_in_bytes) on error.
    """
    try:
        file_size = os.path.getsize(file_path)
        with Image.open(file_path) as img:
            return img.size[0], img.size[1], file_size
    except Exception as e:
        # If it fails to read dimensions (e.g. corrupted file), return size and None for dims
        try:
            return None, None, os.path.getsize(file_path)
        except:
            return None, None, 0

def convert_png_to_webp(src_path, dest_path, quality=85, lossless=False, preserve_transparency=True, overwrite=True):
    """
    Convert a single image to WebP and return details including dimensions.
    Arguments:
      src_path: Path to the source image file.
      dest_path: Path to save the WebP file.
      quality: WebP quality slider value (1-100).
      lossless: Boolean, use lossless mode.
      preserve_transparency: Boolean, keep transparency (alpha channel).
      overwrite: Boolean, overwrite existing destination files.
    Returns:
      (success_bool, message_str, output_size_bytes, width, height)
    """
    try:
        # Create output folder if it doesn't exist
        dest_dir = os.path.dirname(dest_path)
        if dest_dir:
            os.makedirs(dest_dir, exist_ok=True)

        # Handle overwrite check
        if os.path.exists(dest_path) and not overwrite:
            return False, "Destination file already exists and overwrite is disabled.", 0, 0, 0

        # Open image
        with Image.open(src_path) as img:
            # Read dimensions
            width, height = img.size

            # Make sure image is fully loaded before processing
            img.load()

            # Handle Transparency
            has_alpha = (img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info))

            if has_alpha:
                if preserve_transparency:
                    # Convert palette images with transparency to RGBA
                    if img.mode != 'RGBA':
                        img = img.convert('RGBA')
                else:
                    # Remove transparency: paste onto a solid white background
                    if img.mode != 'RGBA':
                        img = img.convert('RGBA')
                    background = Image.new("RGBA", img.size, (255, 255, 255, 255))
                    # Paste transparency on top
                    background.paste(img, (0, 0), img)
                    img = background.convert("RGB")
            else:
                # Keep original or convert to RGB if not already
                if img.mode not in ('RGB', 'L'):
                    img = img.convert('RGB')

            # Save options
            save_args = {
                "format": "WEBP",
                "quality": quality,
                "lossless": lossless
            }
            
            img.save(dest_path, **save_args)
            
        # Get output size
        output_size = os.path.getsize(dest_path)
        return True, "Success", output_size, width, height

    except Exception as e:
        return False, f"Conversion error: {str(e)}", 0, 0, 0
