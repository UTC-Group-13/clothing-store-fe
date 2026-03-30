import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Clothing Store</h3>
            <p className="text-gray-400">
              Thời trang hiện đại cho phong cách mỗi ngày.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition">
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition">
                  Đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@shopvn.com</li>
              <li>Hotline: 1900 xxxx</li>
              <li>Địa chỉ: Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Clothing Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

