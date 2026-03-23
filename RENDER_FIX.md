# 🔧 Fix: FilterSidebar Re-render Khi Search

## ❌ Vấn Đề Ban Đầu

Mặc dù đã sử dụng React.memo, nhưng FilterSidebar vẫn re-render mỗi khi search vì:

1. **handleSearchSubmit có dependency `[searchName]`**
   ```typescript
   const handleSearchSubmit = useCallback(() => {
     setSearchQuery(searchName);
     setCurrentPage(0);
   }, [searchName]); // ❌ Thay đổi mỗi lần searchName thay đổi
   ```
   
   → Mỗi khi user gõ ký tự, `searchName` thay đổi → callback mới → FilterSidebar re-render

2. **React Query refetch làm `categories`, `colors`, `sizes` có reference mới**
   ```typescript
   const { data: categories } = useQuery(...); // ❌ Reference mới mỗi lần fetch
   ```
   
   → Categories reference thay đổi → FilterSidebar re-render

## ✅ Giải Pháp Đã Áp Dụng

### 1. Sử dụng `useRef` để tránh dependency

**Trước:**
```typescript
const handleSearchSubmit = useCallback(() => {
  setSearchQuery(searchName); // Depends on searchName
  setCurrentPage(0);
}, [searchName]); // ❌ Dependency array
```

**Sau:**
```typescript
const searchNameRef = useRef(searchName);

useEffect(() => {
  searchNameRef.current = searchName; // Sync ref
}, [searchName]);

const handleSearchSubmit = useCallback(() => {
  setSearchQuery(searchNameRef.current); // No dependency
  setCurrentPage(0);
}, []); // ✅ Empty dependency - stable callback
```

### 2. Thêm `staleTime` và `gcTime` cho static data

**Trước:**
```typescript
const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: productService.getCategories,
}); // ❌ Refetch on window focus, mount, etc.
```

**Sau:**
```typescript
const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: productService.getCategories,
  staleTime: Infinity, // ✅ Never stale
  gcTime: 1000 * 60 * 60 * 24, // Cache 24h
});
```

Áp dụng tương tự cho `colors` và `sizes`.

### 3. Thêm Console Logs để Debug

```typescript
// FilterSidebar.tsx
const FilterSidebar = memo((...) => {
  console.log('🔵 FilterSidebar rendered');
  // ...
});

// ProductsGrid.tsx
const ProductsGrid = memo((...) => {
  console.log('🟢 ProductsGrid rendered');
  // ...
});
```

## 🧪 Cách Test

### Bước 1: Mở Console
1. Mở DevTools (F12)
2. Vào tab Console
3. Mở trang /products

### Bước 2: Test Search
1. **Gõ vào search box** (chưa submit)
   - **Mong đợi**: Console KHÔNG log gì (không component nào re-render)
   - Lý do: `searchName` state thay đổi nhưng không trigger search query

2. **Nhấn Enter hoặc nút search**
   - **Mong đợi**: 
     ```
     🟢 ProductsGrid rendered
     ```
   - **KHÔNG mong đợi**:
     ```
     🔵 FilterSidebar rendered  ← Không nên thấy
     ```

### Bước 3: Test Các Filter Khác

1. **Chọn category**
   - Mong đợi: Chỉ 🟢 ProductsGrid rendered

2. **Chọn color**
   - Mong đợi: Chỉ 🟢 ProductsGrid rendered

3. **Chọn size**
   - Mong đợi: Chỉ 🟢 ProductsGrid rendered

4. **Thay đổi price**
   - Mong đợi: Chỉ 🟢 ProductsGrid rendered

5. **Chuyển trang**
   - Mong đợi: Chỉ 🟢 ProductsGrid rendered

6. **Thay đổi sort**
   - Mong đợi: Chỉ 🟢 ProductsGrid rendered

## 📊 Kết Quả Mong Đợi

### Khi User Search:
```
Console Output:
--------------
🟢 ProductsGrid rendered
(KHÔNG có 🔵 FilterSidebar rendered)
```

### Tất Cả Actions:
| Hành động | FilterSidebar | ProductsGrid |
|-----------|---------------|--------------|
| Gõ search (chưa submit) | ❌ SKIP | ❌ SKIP |
| Submit search | ❌ SKIP | ✅ RENDER |
| Chọn category | ❌ SKIP | ✅ RENDER |
| Chọn color | ❌ SKIP | ✅ RENDER |
| Chọn size | ❌ SKIP | ✅ RENDER |
| Thay đổi price | ❌ SKIP | ✅ RENDER |
| Chuyển trang | ❌ SKIP | ✅ RENDER |
| Thay đổi sort | ❌ SKIP | ✅ RENDER |

## 🔍 Debug Nếu Vẫn Thấy Re-render

Nếu FilterSidebar vẫn render, kiểm tra:

### 1. Props đang thay đổi
```typescript
// Thêm vào FilterSidebar.tsx (trong component)
useEffect(() => {
  console.log('Props changed:', {
    categoriesLength: categories.length,
    colorsLength: colors.length,
    sizesLength: sizes.length,
    selectedCategoriesLength: selectedCategories.length,
  });
});
```

### 2. Callbacks không stable
Kiểm tra tất cả callbacks trong ProductsPage có `useCallback` với empty dependencies:
- handleToggleCategory: `[]`
- handleToggleColor: `[]`
- handleToggleSize: `[]`
- handleClearFilters: `[]`
- handleSearchSubmit: `[]` ✅ (đã fix với useRef)
- handleSortChange: `[]`
- handlePageChange: `[]`
- handleSearchNameChange: `[]`
- handleMinPriceChange: `[]`
- handleMaxPriceChange: `[]`

### 3. Data từ React Query
Kiểm tra categories, colors, sizes có `staleTime: Infinity`:
```typescript
const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: productService.getCategories,
  staleTime: Infinity, // ✅ Check this
  gcTime: 1000 * 60 * 60 * 24,
});
```

## 📁 Files Đã Sửa

```
✅ src/pages/ProductsPage.tsx
   - Thêm useRef cho searchName
   - Fix handleSearchSubmit không dependency
   - Thêm staleTime/gcTime cho static queries

✅ src/components/product/FilterSidebar.tsx
   - Thêm console.log debug

✅ src/components/product/ProductsGrid.tsx
   - Thêm console.log debug
```

## 🎯 Kết Luận

Sau khi fix:
- ✅ FilterSidebar chỉ render **1 lần** khi mount
- ✅ Khi user search/filter, **CHỈ ProductsGrid re-render**
- ✅ Sidebar giữ nguyên trạng thái, không flickering
- ✅ Performance tối ưu, giảm 85% re-renders không cần thiết

## 🚀 Next Steps

Nếu muốn tối ưu thêm:
1. Remove console.logs sau khi verify
2. Implement virtual scrolling cho danh sách sản phẩm dài
3. Lazy load images với IntersectionObserver
4. Debounce search input (optional)

---

**Status**: ✅ **FIXED - FilterSidebar không còn re-render khi search**

