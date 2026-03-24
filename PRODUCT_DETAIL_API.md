# 📦 Product Detail Page - API Integration Complete

## 🎯 Luồng Hoạt Động

### Bước 1: Load Product Info
```
GET /api/products/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Áo Thun Basic",
    "slug": "ao-thun-basic",
    "description": "Áo thun cotton 100%...",
    "categoryId": 24,
    "basePrice": 149000,
    "brand": "YODY",
    "material": "Cotton 100%",
    "isActive": true
  }
}
```

**Hiển thị:**
- Tên sản phẩm
- Mô tả
- Brand & Material badges
- Base Price (có thể thay đổi nếu có priceOverride)

---

### Bước 2: Load Product Variants (Colors)
```
GET /api/product-variants/product/1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "productId": 1,
      "colorId": 15,
      "colorName": "Đen",
      "colorHexCode": "#000000",
      "images": "[\"img1.jpg\", \"img2.jpg\", \"img3.jpg\"]",
      "isDefault": true
    },
    {
      "id": 2,
      "productId": 1,
      "colorId": 16,
      "colorName": "Trắng",
      "colorHexCode": "#FFFFFF",
      "images": "[\"img4.jpg\", \"img5.jpg\"]",
      "isDefault": false
    }
  ]
}
```

**Hiển thị:**
- Color swatches (buttons với backgroundColor = hexCode)
- Tự động chọn variant có `isDefault: true` hoặc variant đầu tiên
- Khi chọn màu → Load images của variant đó
- Gallery với thumbnail navigation

---

### Bước 3: Load Variant Stocks (Sizes)
```
GET /api/variant-stocks/variant/1  (khi user chọn màu Đen)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "variantId": 1,
      "sizeId": 19,
      "sizeLabel": "S",
      "stockQty": 45,
      "priceOverride": null,
      "sku": "P1-V1-S"
    },
    {
      "id": 2,
      "variantId": 1,
      "sizeId": 20,
      "sizeLabel": "M",
      "stockQty": 60,
      "priceOverride": null,
      "sku": "P1-V1-M"
    },
    {
      "id": 3,
      "variantId": 1,
      "sizeId": 21,
      "sizeLabel": "L",
      "stockQty": 30,
      "priceOverride": 159000,
      "sku": "P1-V1-L"
    },
    {
      "id": 4,
      "variantId": 1,
      "sizeId": 22,
      "sizeLabel": "XL",
      "stockQty": 0,
      "sku": "P1-V1-XL"
    }
  ]
}
```

**Hiển thị:**
- Size buttons grid
- Disabled nếu stockQty = 0
- Hiển thị stock quantity khi chọn size
- Hiển thị SKU
- **Price Override**: Nếu có → hiển thị giá mới thay vì basePrice

---

## 🎨 UI Components

### 1. Product Images Gallery
```
┌─────────────────────────────┐
│                             │
│    Main Product Image       │
│    (Click thumbnails        │
│     to change)              │
│                             │
└─────────────────────────────┘
┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 1 │ │ 2 │ │ 3 │ │ 4 │  ← Thumbnails
└───┘ └───┘ └───┘ └───┘
```

### 2. Color Selection
```
Chọn màu sắc
( ⚫ )  ( ⚪ )  ( 🔘 )  ← Color swatches
 Đen    Trắng   Xám     với checkmark khi selected
```

### 3. Size Selection
```
Chọn kích thước
┌───┐ ┌───┐ ┌───┐ ┌───┐
│ S │ │ M │ │ L │ │ XL│  ← Buttons
└───┘ └───┘ └───┘ └─╱─┘
                    ↑ Disabled (out of stock)

Kho: 30 sản phẩm
SKU: P1-V1-L
```

### 4. Price Display
```
┌─────────────────────────┐
│  159,000₫               │  ← priceOverride
│  Giá đặc biệt cho       │  ← Note if override exists
│  size/màu này           │
└─────────────────────────┘
```

### 5. Quantity Selector
```
Số lượng
┌───┬───────┬───┐
│ - │   5   │ + │  ← Min: 1, Max: stockQty
└───┴───────┴───┘
```

---

## 📁 Files Created/Modified

### Created:
```
✅ src/pages/ProductDetailPageNew.tsx (398 lines)
   - Complete product detail implementation
   - 3-step API call flow
   - Color selection → Size selection → Add to cart
```

### Modified:
```
✅ src/types/index.ts
   - Added ProductVariant interface
   - Added VariantStock interface

✅ src/services/api.ts
   - Added productVariantService.getByProductId()
   - Added variantStockService.getByVariantId()

✅ src/App.tsx
   - Replaced old ProductDetailPage with new one
```

---

## 🔄 State Management

```typescript
// Selected state
const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
const [quantity, setQuantity] = useState(1);
const [selectedImageIndex, setSelectedImageIndex] = useState(0);

// Queries
const { data: product } = useQuery(['product', id], ...);
const { data: variants } = useQuery(['product-variants', id], ...);
const { data: stocks } = useQuery(['variant-stocks', selectedVariantId], ...);
// ↑ Chỉ fetch khi selectedVariantId có giá trị
```

---

## 🎯 Business Logic

### Price Calculation
```typescript
finalPrice = selectedStock?.priceOverride || product?.basePrice || 0
```

### Add to Cart Validation
```typescript
1. Check product exists
2. Check variant selected
3. Check size selected
4. Check stock available (stockQty >= quantity)
5. Create cart item with:
   - finalPrice (with override if any)
   - selectedVariantId
   - selectedSizeId
   - colorName
   - sizeLabel
   - image from variant
```

### Auto-Selection
```typescript
// Tự động chọn variant default khi load
useMemo(() => {
  if (variants.length > 0 && !selectedVariantId) {
    const defaultVariant = variants.find(v => v.isDefault) || variants[0];
    setSelectedVariantId(defaultVariant.id);
  }
}, [variants]);
```

---

## 🧪 Testing Flow

### Test Case 1: Normal Flow
```
1. Load page /product/1
   ✓ Product info displays
   ✓ Variants (colors) load
   ✓ Default variant auto-selected
   ✓ Stocks for default variant load

2. User clicks different color
   ✓ Images change
   ✓ Stocks refetch for new variant
   ✓ Size selection resets

3. User selects size
   ✓ Stock quantity shows
   ✓ SKU shows
   ✓ Price updates if override exists

4. User adds to cart
   ✓ Validation passes
   ✓ Toast success
   ✓ Item added with correct data
```

### Test Case 2: Out of Stock Size
```
1. Select variant
2. Try to select size with stockQty = 0
   ✓ Button disabled
   ✓ Visual strikethrough
   ✗ Cannot select
```

### Test Case 3: Price Override
```
1. Select color: Đen
2. Select size: L (has priceOverride)
   ✓ Price changes from 149,000₫ to 159,000₫
   ✓ Note displays "Giá đặc biệt..."
```

---

## 📊 API Call Sequence Diagram

```
Page Load
    │
    ├─→ GET /api/products/1
    │   └─→ Display: name, desc, brand, material, basePrice
    │
    ├─→ GET /api/product-variants/product/1
    │   ├─→ Display: color swatches
    │   └─→ Auto-select default variant
    │           │
    │           └─→ GET /api/variant-stocks/variant/1
    │               └─→ Display: size buttons with stock info
    │
User clicks different color (variant 2)
    │
    └─→ GET /api/variant-stocks/variant/2
        └─→ Update: sizes for new color
```

---

## 🎨 UI Features

### Implemented:
- ✅ Product image gallery with thumbnails
- ✅ Color selection with hex code display
- ✅ Size selection with stock indicators
- ✅ Real-time price calculation (with override)
- ✅ Stock quantity display
- ✅ SKU display
- ✅ Quantity selector with limits
- ✅ Add to cart validation
- ✅ Loading states
- ✅ Error states
- ✅ Breadcrumb navigation
- ✅ Responsive design
- ✅ Toast notifications

### Price Override Logic:
```
If size L has priceOverride: 159000
→ Display: 159,000₫
→ Note: "Giá đặc biệt cho size/màu này"

If size M has priceOverride: null
→ Display: 149,000₫ (basePrice)
→ No note
```

---

## 🚀 How to Test

### Backend Requirements:
```bash
# 1. Start backend
Backend running on http://160.30.113.40:8080

# 2. Create sample data (if not exists)
POST /api/sample-data/generate
```

### Frontend Testing:
```bash
# 1. Start dev server
npm run dev

# 2. Navigate to product detail
http://localhost:5173/product/1

# 3. Test flow:
- ✓ Product info loads
- ✓ Colors display
- ✓ Click different colors → images change
- ✓ Sizes load for each color
- ✓ Select size → see stock, SKU
- ✓ Change quantity
- ✓ Add to cart → validation works
```

---

## 💡 Key Features

1. **Dynamic Color Selection**
   - Each color (variant) has its own images
   - Switching color fetches new sizes/stocks

2. **Smart Price Display**
   - Base price from product
   - Override price from variant stock
   - Visual indicator when override applies

3. **Stock Management**
   - Real-time stock checking
   - Disabled sizes when out of stock
   - Quantity limited by available stock

4. **User Experience**
   - Auto-select default color
   - Clear visual feedback
   - Validation before add to cart
   - Loading states for all API calls

---

## ✅ Summary

**Implemented:**
- ✅ 3-step API call flow exactly as specified
- ✅ Product → Variants → Stocks
- ✅ Color selection with images
- ✅ Size selection with stock info
- ✅ Price override handling
- ✅ Complete UI with all validations

**Files:**
- ✅ ProductDetailPageNew.tsx (main implementation)
- ✅ API services for variants and stocks
- ✅ Type definitions for DTOs

**Ready for:**
- ✅ Production use
- ✅ Backend integration
- ✅ User testing

---

**Status**: ✅ **COMPLETE - Product Detail với đầy đủ luồng API** 🎉

