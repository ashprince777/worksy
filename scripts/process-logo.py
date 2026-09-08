from PIL import Image, ImageChops
import numpy as np

def make_transparent(img, bg_color=(250, 251, 254), tolerance=20):
    img = img.convert("RGBA")
    data = np.array(img)
    
    # Calculate difference from background
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    bg_r, bg_g, bg_b = bg_color
    
    # Distance from background color
    diff = np.sqrt((r.astype(float) - bg_r)**2 + (g.astype(float) - bg_g)**2 + (b.astype(float) - bg_b)**2)
    
    # Soft alpha feathering near edges
    alpha = np.clip((diff / tolerance) * 255, 0, 255).astype(np.uint8)
    
    # For pixels far from background, preserve full opacity
    mask_full = diff > (tolerance * 1.5)
    alpha[mask_full] = 255
    
    data[:,:,3] = alpha
    return Image.fromarray(data, "RGBA")

def main():
    orig = Image.open("public/logo.png")
    w, h = orig.size
    
    # Sample background color around borders
    bg_r = int(np.mean([orig.getpixel((0,0))[0], orig.getpixel((w-1, 0))[0], orig.getpixel((0, h-1))[0], orig.getpixel((w-1, h-1))[0]]))
    bg_g = int(np.mean([orig.getpixel((0,0))[1], orig.getpixel((w-1, 0))[1], orig.getpixel((0, h-1))[1], orig.getpixel((w-1, h-1))[1]]))
    bg_b = int(np.mean([orig.getpixel((0,0))[2], orig.getpixel((w-1, 0))[2], orig.getpixel((0, h-1))[2], orig.getpixel((w-1, h-1))[2]]))
    
    trans = make_transparent(orig, bg_color=(bg_r, bg_g, bg_b), tolerance=22)
    
    # Trim empty borders
    bbox = trans.getbbox()
    if bbox:
        trans_cropped = trans.crop(bbox)
    else:
        trans_cropped = trans
        
    trans_cropped.save("public/logo.png", "PNG")
    print("Saved public/logo.png", trans_cropped.size)
    
    # Extract icon (left portion containing W and dot)
    # The W mark is on the left roughly from x=0 to x=360 in the original image
    icon_w = int(orig.width * 0.40)
    icon_crop = trans.crop((0, 0, icon_w, orig.height))
    icon_bbox = icon_crop.getbbox()
    if icon_bbox:
        icon = icon_crop.crop(icon_bbox)
    else:
        icon = icon_crop
        
    # Pad to square
    max_dim = max(icon.width, icon.height)
    square_icon = Image.new("RGBA", (max_dim + 20, max_dim + 20), (0, 0, 0, 0))
    offset_x = (max_dim + 20 - icon.width) // 2
    offset_y = (max_dim + 20 - icon.height) // 2
    square_icon.paste(icon, (offset_x, offset_y), icon)
    
    square_icon.save("public/logo-icon.png", "PNG")
    square_icon.resize((64, 64), Image.Resampling.LANCZOS).save("public/favicon.ico", "ICO")
    print("Saved public/logo-icon.png and public/favicon.ico", square_icon.size)
    
    # Create dark-mode logo (with white text)
    # The text is on the right. For the dark mode version, we turn the dark text pixels into crisp white, while preserving the vibrant blue/cyan W-mark!
    dark_data = np.array(trans_cropped)
    # Identify dark text pixels (low R, G, B and high alpha)
    text_mask = (dark_data[:,:,0] < 45) & (dark_data[:,:,1] < 45) & (dark_data[:,:,2] < 70) & (dark_data[:,:,3] > 100)
    # Subtitle gray text pixels
    sub_mask = (dark_data[:,:,0] > 70) & (dark_data[:,:,0] < 150) & (dark_data[:,:,1] > 70) & (dark_data[:,:,1] < 160) & (dark_data[:,:,2] > 90) & (dark_data[:,:,3] > 80)
    
    dark_data_img = dark_data.copy()
    dark_data_img[text_mask, 0] = 255
    dark_data_img[text_mask, 1] = 255
    dark_data_img[text_mask, 2] = 255
    
    dark_data_img[sub_mask, 0] = 203 # slate-300
    dark_data_img[sub_mask, 1] = 213
    dark_data_img[sub_mask, 2] = 225
    
    dark_logo = Image.fromarray(dark_data_img, "RGBA")
    dark_logo.save("public/logo-white.png", "PNG")
    print("Saved public/logo-white.png")

if __name__ == "__main__":
    main()
