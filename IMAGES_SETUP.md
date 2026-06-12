# How to Add Dish Images

The QR Restaurant Menu application displays high-quality images for each dish. Here's how to add images:

## Image Directory Structure

Create the following directory structure:

```
public/
├── images/
│   ├── dishes/
│   │   ├── turkish-breakfast-menemen.jpg
│   │   ├── turkish-breakfast-sucuklu.jpg
│   │   ├── turkish-breakfast-pide.jpg
│   │   ├── turkish-breakfast-borek.jpg
│   │   ├── eggs-scrambled.jpg
│   │   ├── eggs-fried.jpg
│   │   ├── eggs-omelette.jpg
│   │   ├── eggs-shakshuka.jpg
│   │   ├── pancakes-classic.jpg
│   │   ├── pancakes-chocolate.jpg
│   │   ├── pancakes-strawberry.jpg
│   │   ├── pancakes-blueberry.jpg
│   │   ├── waffles-classic.jpg
│   │   ├── waffles-chocolate.jpg
│   │   ├── waffles-strawberry.jpg
│   │   ├── waffles-nutella.jpg
│   │   └── waffles-caramel.jpg
│   └── logo.png
```

## Image Specifications

### Recommended Size
- **Width**: 800px - 1200px
- **Height**: 600px - 800px
- **Aspect Ratio**: 4:3 or 1:1

### File Format
- **Format**: JPEG or WebP (recommended)
- **Compression**: Optimize for web (70-80% quality)
- **File Size**: < 200KB per image

### Content
- Clear, well-lit product photography
- Food should look appetizing
- Consistent lighting and style
- Show the dish on a plate/bowl

## How to Update menu.json

Update the `image` field in `src/data/menu.json`:

```json
{
  "items": [
    {
      "id": "menemen",
      "image": "/images/dishes/turkish-breakfast-menemen.jpg",
      "name": "Menemen",
      ...
    }
  ]
}
```

## Image URL Format

Images can be loaded from:

### 1. Local Public Folder (Recommended)
```
/images/dishes/menemen.jpg
```

### 2. External URLs
```
https://example.com/images/menemen.jpg
```

### 3. Data URLs
```
data:image/jpeg;base64,/9j/4AAQSkZJRg...
```

## Fallback Behavior

If an image fails to load, the application displays:
- Error SVG icon
- Dish name
- "Click to view details"

This prevents blank spaces and broken layouts.

## Performance Tips

### Image Optimization
1. Use image optimization tools:
   - [TinyJPG](https://tinyjpg.com/) - JPEG compression
   - [ImageOptim](https://imageoptim.com/) - Mac tool
   - [ImageMagick](https://imagemagick.org/) - CLI tool

2. Use WebP format for better compression:
   ```bash
   cwebp input.jpg -o input.webp
   ```

3. Create multiple sizes for responsive images:
   - Mobile: 600px width
   - Tablet: 800px width
   - Desktop: 1000px width

### Lazy Loading
Images are automatically lazy-loaded when they enter the viewport (browser native support).

## Testing Image Loading

### Check Network
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "img"
4. Check image sizes and load times

### Test Fallback
1. Open DevTools Console
2. Run: `document.querySelectorAll('img').forEach(img => img.src = '')`
3. Check that SVG fallback appears

## Image Attribution

If using images from external sources, make sure to:
- Respect copyright and licensing
- Include attribution if required
- Use royalty-free or properly licensed images

### Recommended Free Resources
- [Unsplash](https://unsplash.com/) - Free high-quality images
- [Pexels](https://www.pexels.com/) - Free stock photos
- [Pixabay](https://pixabay.com/) - Royalty-free images
- [Foodiesfeed](https://www.foodiesfeed.com/) - Food photography

## Updating Images Later

To update a dish image:

1. Replace the file in `public/images/dishes/`
2. Keep the same filename
3. Browser cache will clear after ~1 hour
4. Force refresh with Ctrl+Shift+R or Cmd+Shift+R

## Mobile Optimization

For mobile users:
1. Use smaller images (300-600px width)
2. Compress aggressively (JPEG 70-75% quality)
3. Use WEBP if supported by target browsers
4. Monitor loading performance

## Build Optimization

When building for production:

```bash
npm run build
```

Vite automatically:
- Optimizes images
- Creates responsive variants
- Minifies and compresses
- Generates source maps

## Troubleshooting

### Images Not Showing
1. Check file path matches image in menu.json
2. Verify file exists in public/images/dishes/
3. Check browser console for 404 errors
4. Clear browser cache (Ctrl+Shift+Delete)

### Images Load Slowly
1. Check file size (should be < 200KB)
2. Verify image dimensions (not oversized)
3. Check network connection
4. Enable GZIP compression on server

### Quality Issues
1. Re-export from Photoshop/GIMP with better quality
2. Use lossless compression initially
3. Verify aspect ratio is correct
4. Check lighting in original photo

## Advanced: Responsive Images

For advanced responsive images, update MenuCard.tsx:

```tsx
<picture>
  <source 
    srcSet="/images/dishes/menemen-large.webp"
    media="(min-width: 1024px)"
    type="image/webp"
  />
  <source 
    srcSet="/images/dishes/menemen-medium.webp"
    media="(min-width: 640px)"
    type="image/webp"
  />
  <img 
    src="/images/dishes/menemen-small.jpg"
    alt="Menemen"
    className="w-full h-48 object-cover rounded-xl"
  />
</picture>
```

## Sample Images Setup

To quickly test with sample images:

1. Download from Foodiesfeed or Unsplash
2. Save to `public/images/dishes/`
3. Rename to match IDs in menu.json
4. Restart dev server

Example commands:
```bash
mkdir -p public/images/dishes
# Download and save images here
```

## Next Steps

1. ✅ Create public/images/dishes/ folder
2. ✅ Add 17 dish images (one per item)
3. ✅ Update image paths in menu.json
4. ✅ Test in development (npm run dev)
5. ✅ Verify responsiveness (mobile/tablet/desktop)
6. ✅ Build for production (npm run build)
