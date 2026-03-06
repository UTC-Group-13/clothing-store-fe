import React from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
  ShoppingOutlined,
  UserOutlined,
  DollarOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const Dashboard = () => {
  return (
    <div>
      <Title level={2}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={125}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Danh mục"
              value={8}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người dùng"
              value={452}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu (VNĐ)"
              value={125000000}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Hoạt động gần đây">
            <p>- Sản phẩm mới được thêm: "Áo thun premium"</p>
            <p>- Đơn hàng #1234 đã được xác nhận</p>
            <p>- Người dùng mới đăng ký: user@example.com</p>
            <p>- Danh mục "Áo khoác" đã được cập nhật</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sản phẩm bán chạy">
            <p>1. Áo thun basic - 156 đơn</p>
            <p>2. Quần jean slim fit - 142 đơn</p>
            <p>3. Áo sơ mi công sở - 128 đơn</p>
            <p>4. Váy midi - 98 đơn</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

