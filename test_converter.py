import os
import unittest
import tempfile
from PIL import Image

# Import functions to test
from converter_logic import scan_directory, get_image_metadata, convert_png_to_webp

class TestConverterLogic(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for test files
        self.test_dir = tempfile.mkdtemp()
        self.png_width = 100
        self.png_height = 80
        
        # Create a standard solid color PNG
        self.solid_png_path = os.path.join(self.test_dir, "solid.png")
        img_solid = Image.new("RGB", (self.png_width, self.png_height), color="red")
        img_solid.save(self.solid_png_path, "PNG")

        # Create a transparent PNG (RGBA)
        self.transparent_png_path = os.path.join(self.test_dir, "transparent.png")
        img_trans = Image.new("RGBA", (self.png_width, self.png_height), color=(0, 255, 0, 128))
        img_trans.save(self.transparent_png_path, "PNG")

        # Create a subfolder with a nested PNG
        self.sub_dir = os.path.join(self.test_dir, "nested_folder")
        os.makedirs(self.sub_dir, exist_ok=True)
        self.nested_png_path = os.path.join(self.sub_dir, "nested.png")
        img_solid.save(self.nested_png_path, "PNG")

    def tearDown(self):
        # Clean up files and directories
        for root, dirs, files in os.walk(self.test_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        os.rmdir(self.test_dir)

    def test_scan_directory(self):
        """Test scanning finds PNG files recursively."""
        files = scan_directory(self.test_dir)
        # Should find solid.png, transparent.png, and nested.png
        self.assertEqual(len(files), 3)
        
        # Verify absolute paths are returned
        for f in files:
            self.assertTrue(os.path.isabs(f))
            self.assertTrue(f.lower().endswith('.png'))

    def test_get_image_metadata(self):
        """Test dimensions and size reading."""
        w, h, size = get_image_metadata(self.solid_png_path)
        self.assertEqual(w, self.png_width)
        self.assertEqual(h, self.png_height)
        self.assertGreater(size, 0)

        # Test on missing file
        w_err, h_err, size_err = get_image_metadata("non_existent_file.png")
        self.assertIsNone(w_err)
        self.assertIsNone(h_err)
        self.assertEqual(size_err, 0)

    def test_convert_lossy(self):
        """Test lossy conversion to WebP."""
        dest_webp = os.path.join(self.test_dir, "lossy.webp")
        success, msg, out_size, _, _ = convert_png_to_webp(
            src_path=self.solid_png_path,
            dest_path=dest_webp,
            quality=80,
            lossless=False
        )
        
        self.assertTrue(success)
        self.assertEqual(msg, "Success")
        self.assertTrue(os.path.exists(dest_webp))
        self.assertGreater(out_size, 0)

        # Verify output is a valid WebP image and matches dimensions
        with Image.open(dest_webp) as webp_img:
            self.assertEqual(webp_img.format, "WEBP")
            self.assertEqual(webp_img.size, (self.png_width, self.png_height))

    def test_convert_lossless(self):
        """Test lossless conversion."""
        dest_webp = os.path.join(self.test_dir, "lossless.webp")
        success, msg, out_size, _, _ = convert_png_to_webp(
            src_path=self.solid_png_path,
            dest_path=dest_webp,
            lossless=True
        )
        
        self.assertTrue(success)
        self.assertTrue(os.path.exists(dest_webp))
        
        with Image.open(dest_webp) as webp_img:
            self.assertEqual(webp_img.format, "WEBP")

    def test_convert_transparency_preservation(self):
        """Test transparent image alpha preservation."""
        # 1. Preserving transparency
        dest_webp_trans = os.path.join(self.test_dir, "trans_yes.webp")
        success, _, _, _, _ = convert_png_to_webp(
            src_path=self.transparent_png_path,
            dest_path=dest_webp_trans,
            preserve_transparency=True
        )
        self.assertTrue(success)
        with Image.open(dest_webp_trans) as img:
            # WebP supports alpha channel
            self.assertIn(img.mode, ("RGBA", "LA"))

        # 2. Removing transparency
        dest_webp_no_trans = os.path.join(self.test_dir, "trans_no.webp")
        success, _, _, _, _ = convert_png_to_webp(
            src_path=self.transparent_png_path,
            dest_path=dest_webp_no_trans,
            preserve_transparency=False
        )
        self.assertTrue(success)
        with Image.open(dest_webp_no_trans) as img:
            # Should be RGB (no alpha channel)
            self.assertEqual(img.mode, "RGB")

    def test_overwrite_option(self):
        """Test overwrite flag behavior."""
        dest_webp = os.path.join(self.test_dir, "overwrite_test.webp")
        
        # Convert first time
        success, _, _, _, _ = convert_png_to_webp(self.solid_png_path, dest_webp, overwrite=True)
        self.assertTrue(success)
        
        # Convert second time with overwrite = False (should fail)
        success_no_overwrite, msg, _, _, _ = convert_png_to_webp(self.solid_png_path, dest_webp, overwrite=False)
        self.assertFalse(success_no_overwrite)
        self.assertIn("already exists", msg)
        
        # Convert third time with overwrite = True (should succeed)
        success_overwrite, _, _, _, _ = convert_png_to_webp(self.solid_png_path, dest_webp, overwrite=True)
        self.assertTrue(success_overwrite)

if __name__ == "__main__":
    unittest.main()
