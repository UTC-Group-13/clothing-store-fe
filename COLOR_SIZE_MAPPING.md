# ✅ Product Detail Page - Color & Size Mapping Complete

## 🎯 Yêu Cầu
Fetch danh sách colors và sizes từ API, sau đó map với colorId và sizeId để hiển thị thông tin đầy đủ.

---

## ✅ Implementation

### 1. Fetch Full Lists

```typescript
// Fetch all colors (cached)
const { data: allColors = [] } = useQuery({
  queryKey: ['colors'],
  queryFn: colorService.getAllColors,
  staleTime: Infinity,  // Never refetch
  gcTime: 1000 * 60 * 60 * 24,  // Cache 24h
});

// Fetch all sizes (cached)
const { data: allSizes = [] } = useQuery({
  queryKey: ['sizes'],
  queryFn: sizeService.getAllSizes,
  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24,
});
```

### 2. Create Maps for Quick Lookup

```typescript
// Color Map: colorId → Color object
const colorsMap = useMemo(() => {
  return new Map(allColors.map(color => [color.id, color]));
}, [allColors]);

// Size Map: sizeId → Size object
const sizesMap = useMemo(() => {
  return new Map(allSizes.map(size => [size.id, size]));
}, [allSizes]);
```

**Benefits:**
- O(1) lookup performance
- Type-safe access
- Auto-updates when data changes

---

## 🎨 Color Selection Updates

### Before (Only variant data):
```typescript
<button
  style={{ backgroundColor: variant.colorHexCode || '#ccc' }}
  title={variant.colorName}
>
  {variant.colorName}
</button>
```

### After (Map lookup with fallback):
```typescript
const colorInfo = colorsMap.get(variant.colorId);
const displayColor = colorInfo?.hexCode || variant.colorHexCode || '#ccc';
const displayName = colorInfo?.name || variant.colorName || 'Unknown';

<button
  style={{ backgroundColor: displayColor }}
  title={displayName}
  aria-label={displayName}
>
  {/* Special handling for white */}
  {displayColor === '#FFFFFF' && (
    <div className="w-full h-full rounded-full border border-gray-300" />
  )}
</button>
```

**Improvements:**
- ✅ Primary: Use colorsMap data (accurate hex code)
- ✅ Fallback: Use variant data (if map fails)
- ✅ Default: '#ccc' (if all fails)
- ✅ Special white color border for visibility
- ✅ Accessibility: aria-label

### Display Selected Color:
```typescript
Màu đã chọn: {colorsMap.get(variant.colorId)?.name || variant.colorName}
```

---

## 📏 Size Selection Updates

### Before (Only stock data):
```typescript
{stocks.map((stock) => (
  <button>
    {stock.sizeLabel}
  </button>
))}
```

### After (Map lookup + sorting + type info):
```typescript
{stocks
  .sort((a, b) => {
    const sizeA = sizesMap.get(a.sizeId);
    const sizeB = sizesMap.get(b.sizeId);
    return (sizeA?.sortOrder || 0) - (sizeB?.sortOrder || 0);
  })
  .map((stock) => {
    const sizeInfo = sizesMap.get(stock.sizeId);
    const displayLabel = sizeInfo?.label || stock.sizeLabel || 'N/A';
    
    return (
      <button>{displayLabel}</button>
    );
  })}
```

**Improvements:**
- ✅ Sorted by sortOrder từ sizes API
- ✅ Primary: Use sizesMap data
- ✅ Fallback: Use stock data
- ✅ Type indicator (clothing vs numeric)

### Size Type Indicator:
```typescript
{/* Hiển thị loại size */}
<div className="text-xs text-gray-500">
  Loại: {sizesMap.get(stocks[0].sizeId)?.type === 'clothing' ? 'Size chữ' : 'Size số'}
</div>
```

### Enhanced Stock Info Display:
```typescript
{selectedStock && (
  <div className="space-y-1">
    {/* Stock quantity với color coding */}
    <p className="text-sm text-gray-600">
      Kho: <span className={`font-medium ${
        selectedStock.stockQty < 10 ? 'text-red-600' : 'text-green-600'
      }`}>
        {selectedStock.stockQty} sản phẩm
        {selectedStock.stockQty < 10 && selectedStock.stockQty > 0 && ' (Sắp hết)'}
      </span>
    </p>

    {/* SKU với font mono */}
    <p className="text-sm text-gray-600">
      SKU: <span className="font-medium font-mono">{selectedStock.sku}</span>
    </p>

    {/* Size info từ sizesMap */}
    {sizesMap.get(selectedStock.sizeId) && (
      <p className="text-sm text-gray-600">
        Size: <span className="font-medium">
          {sizesMap.get(selectedStock.sizeId)?.label}
          {sizesMap.get(selectedStock.sizeId)?.type === 'numeric' && ' (số)'}
        </span>
      </p>
    )}
  </div>
)}
```

---

## 🛒 Add to Cart Enhanced

### Before:
```typescript
const cartItem = {
  ...product,
  selectedColorName: selectedVariant?.colorName,
  selectedSizeLabel: selectedStock?.sizeLabel,
};
```

### After (Full info from maps):
```typescript
const selectedColorInfo = colorsMap.get(selectedVariant!.colorId);
const selectedSizeInfo = sizesMap.get(selectedSizeId);

const cartItem = {
  ...product,
  price: finalPrice,
  basePrice: finalPrice,
  quantity: quantity,
  selectedVariantId,
  selectedSizeId,
  selectedColorName: selectedColorInfo?.name || selectedVariant?.colorName || 'N/A',
  selectedColorHex: selectedColorInfo?.hexCode,  // ✅ NEW: Hex code
  selectedSizeLabel: selectedSizeInfo?.label || selectedStock?.sizeLabel || 'N/A',
  selectedSizeType: selectedSizeInfo?.type,      // ✅ NEW: Size type
  sku: selectedStock?.sku,                       // ✅ NEW: SKU
  image: productImages[0],
  name: product.name,
};
```

**Added to cart item:**
- ✅ `selectedColorHex` - Hex code của màu
- ✅ `selectedSizeType` - Type của size (clothing/numeric)
- ✅ `sku` - Mã SKU
- ✅ `name` - Tên sản phẩm

---

## 📊 Data Flow

```
API Calls:
├─→ GET /api/colors
│   └─→ Cache Infinity → colorsMap
│
├─→ GET /api/sizes  
│   └─→ Cache Infinity → sizesMap
│
├─→ GET /api/product-variants/product/1
│   └─→ variants[] with colorId
│       │
│       └─→ Map: colorId → colorsMap.get(colorId)
│           ├─→ name: "Đen"
│           ├─→ hexCode: "#000000"
│           └─→ slug: "den"
│
└─→ GET /api/variant-stocks/variant/1
    └─→ stocks[] with sizeId
        │
        └─→ Map: sizeId → sizesMap.get(sizeId)
            ├─→ label: "L"
            ├─→ type: "clothing"
            └─→ sortOrder: 3
```

---

## 🎯 Display Improvements

### Color Display:
```
Before: variant.colorName = "Đen"
After:  colorsMap.get(15) = {
          id: 15,
          name: "Đen",
          hexCode: "#000000",
          slug: "den"
        }
```

**Display:**
- Color swatch với chính xác hex code từ colors API
- Tên màu chuẩn từ database
- Border cho màu trắng
- Accessibility labels

### Size Display:
```
Before: stock.sizeLabel = "L" (unsorted)
After:  sizesMap.get(21) = {
          id: 21,
          label: "L",
          type: "clothing",
          sortOrder: 3
        }
```

**Display:**
- Sizes được sắp xếp theo sortOrder
- Hiển thị type indicator (chữ/số)
- Full size information
- Stock status với color coding

---

## 💡 Key Enhancements

### 1. **Accurate Color Display**
```typescript
// Priority cascade
1. colorsMap.get(colorId)?.hexCode  ← Primary (từ colors API)
2. variant.colorHexCode             ← Fallback
3. '#ccc'                           ← Default

// Result: Màu chính xác từ database
```

### 2. **Sorted Sizes**
```typescript
stocks.sort((a, b) => {
  const sizeA = sizesMap.get(a.sizeId);
  const sizeB = sizesMap.get(b.sizeId);
  return (sizeA?.sortOrder || 0) - (sizeB?.sortOrder || 0);
})

// Result: XS → S → M → L → XL → XXL → 3XL (đúng thứ tự)
```

### 3. **Enhanced Stock Info**
```typescript
Stock display:
- Green text: >= 10 items (enough stock)
- Red text: < 10 items (running low)
- Warning: "Sắp hết" if < 10 but > 0
- Font mono cho SKU (dễ đọc)
```

### 4. **Size Type Badge**
```typescript
<div className="text-xs text-gray-500">
  Loại: {type === 'clothing' ? 'Size chữ' : 'Size số'}
</div>
```

---

## 🧪 Testing

### Test Case 1: Color Mapping
```
1. Load product detail
2. Observe colors:
   ✓ Hex codes chính xác (#000000, #FFFFFF, etc.)
   ✓ Màu trắng có border
   ✓ Tên màu từ database
```

### Test Case 2: Size Mapping
```
1. Select color
2. Observe sizes:
   ✓ Sorted correctly (S → M → L → XL)
   ✓ Type indicator shows
   ✓ Labels from sizes API
```

### Test Case 3: Stock Info
```
1. Select size với stock < 10:
   ✓ Red text
   ✓ "(Sắp hết)" warning
   
2. Select size với stock >= 10:
   ✓ Green text
   ✓ No warning
```

### Test Case 4: Add to Cart
```
1. Select color + size
2. Add to cart
3. Check cart item:
   ✓ selectedColorName: "Đen"
   ✓ selectedColorHex: "#000000"
   ✓ selectedSizeLabel: "L"
   ✓ selectedSizeType: "clothing"
   ✓ sku: "P1-V1-L"
```

---

## 📁 Files Modified

```
✅ src/pages/ProductDetailPageNew.tsx
   + Import colorService, sizeService
   + Fetch allColors với cache
   + Fetch allSizes với cache
   + Create colorsMap (Map<id, Color>)
   + Create sizesMap (Map<id, Size>)
   + Update color selection UI
   + Update size selection UI
   + Sort sizes by sortOrder
   + Enhanced stock info display
   + Update cart item với full info
```

---

## 🎨 Visual Enhancements

### Color Swatches:
```
Before: [🔴] [⚪] [🔵]
        Plain colors

After:  [🔴] [⚪] [🔵]
        ↑     ↑     ↑
     Accurate Border Check
     hex code for    mark
              white
```

### Size Buttons:
```
Before: M  L  S  XL  (unsorted)

After:  S  M  L  XL  (sorted by sortOrder)
        ↑
        Loại: Size chữ
```

### Stock Info:
```
Before:
Kho: 30 sản phẩm
SKU: P1-V1-L

After:
Kho: 30 sản phẩm      (green - enough)
Kho: 8 sản phẩm (Sắp hết)  (red - low)
SKU: P1-V1-L          (monospace font)
Size: L (chữ)         (with type)
```

---

## 📊 Performance Impact

### API Calls:
```
Initial page load:
1. GET /api/colors     ← Cached forever
2. GET /api/sizes      ← Cached forever
3. GET /api/products/1
4. GET /api/product-variants/product/1
5. GET /api/variant-stocks/variant/1

Subsequent actions:
- Change color: Only fetch stocks (step 5)
- Change product: Reuse colors/sizes cache
```

**Result:** Colors & sizes chỉ fetch 1 lần duy nhất!

### Memory Efficiency:
```typescript
Map lookup: O(1)
Array search: O(n)

Using Map → Faster lookups
```

---

## 🎯 Benefits

### 1. **Data Accuracy**
- ✅ Hex codes chính xác từ colors API
- ✅ Size labels và types từ sizes API
- ✅ Không depend vào variant/stock response

### 2. **Better UX**
- ✅ Colors hiển thị đúng màu
- ✅ Sizes sắp xếp đúng thứ tự
- ✅ Stock status với color coding
- ✅ Type indicators helpful

### 3. **Maintainability**
- ✅ Single source of truth (colors/sizes APIs)
- ✅ Easy to update color/size definitions
- ✅ Consistent across app

### 4. **Performance**
- ✅ Cache static data (colors, sizes)
- ✅ Fast Map lookups
- ✅ No redundant fetches

---

## 📋 Mapping Examples

### Color Mapping:
```typescript
// Variant có colorId
variant = {
  id: 1,
  colorId: 15,
  colorName: "Đen",        // Có thể outdated
  colorHexCode: "#000000"  // Có thể outdated
}

// Lookup từ colorsMap
colorInfo = colorsMap.get(15)
// → {
//     id: 15,
//     name: "Đen",         // ✅ Latest từ DB
//     hexCode: "#000000",  // ✅ Accurate
//     slug: "den"
//   }

// Display
backgroundColor: colorInfo.hexCode  // ✅ Always accurate
title: colorInfo.name               // ✅ Always latest
```

### Size Mapping:
```typescript
// Stock có sizeId
stock = {
  id: 3,
  sizeId: 21,
  sizeLabel: "L",    // Có thể outdated
  stockQty: 30
}

// Lookup từ sizesMap
sizeInfo = sizesMap.get(21)
// → {
//     id: 21,
//     label: "L",         // ✅ Latest
//     type: "clothing",   // ✅ Extra info
//     sortOrder: 3        // ✅ For sorting
//   }

// Display
label: sizeInfo.label        // ✅ Latest
type: sizeInfo.type          // ✅ Clothing/Numeric
sortOrder: sizeInfo.sortOrder // ✅ For ordering
```

---

## 🎨 UI Examples

### Color Selection Display:
```
┌──────────────────────────────┐
│ Chọn màu sắc                 │
│                              │
│ ( ⚫ ) ( ⚪ ) ( 🔘 ) ( 🟡 )  │
│   ✓                          │
│  Đen   Trắng  Xám   Vàng     │
│                              │
│ Màu đã chọn: Đen             │
└──────────────────────────────┘
```

### Size Selection Display:
```
┌──────────────────────────────┐
│ Chọn kích thước              │
│                              │
│ [ S ] [ M ] [ L ] [ XL ]     │
│         ✓                    │
│                              │
│ Loại: Size chữ               │
│                              │
│ Kho: 30 sản phẩm (green)     │
│ SKU: P1-V1-L                 │
│ Size: L (chữ)                │
└──────────────────────────────┘
```

### Stock Status Colors:
```
Kho: 50 sản phẩm              (green - >= 10)
Kho: 8 sản phẩm (Sắp hết)     (red - < 10)
Kho: 0 sản phẩm               (button disabled)
```

---

## ✅ Summary

**What Changed:**
- ✅ Added colors API fetch với Infinity cache
- ✅ Added sizes API fetch với Infinity cache
- ✅ Created Maps for O(1) lookups
- ✅ Updated color display với accurate hex codes
- ✅ Updated size display với sortOrder
- ✅ Added size type indicators
- ✅ Enhanced stock info với color coding
- ✅ Add to cart saves full color/size info

**Benefits:**
- ✅ Data accuracy (từ colors/sizes APIs)
- ✅ Better UX (sorted, color-coded)
- ✅ Performance (cached, Map lookups)
- ✅ Maintainable (single source of truth)

**Files Modified:**
```
✅ src/pages/ProductDetailPageNew.tsx
```

---

## 🚀 Testing

```bash
# Start dev server
npm run dev

# Test:
1. Go to product detail page
2. Verify colors có hex codes chính xác
3. Verify sizes sorted correctly
4. Verify stock info hiển thị đầy đủ
5. Add to cart và check cart item data
```

**Status:** ✅ **COMPLETE - Colors & Sizes Mapped!** 🎉

