import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Upload, message, Space, Popconfirm, Image, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProductManagement = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Áo Thun Basic Trắng',
      price: 199000,
      category: 'Áo',
      stock: 50,
      description: 'Áo thun chất liệu cotton cao cấp',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: 'Quần Jean Slim Fit',
      price: 599000,
      category: 'Quần',
      stock: 30,
      description: 'Quần jean form slim fit hiện đại',
      image: 'https://via.placeholder.com/150',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  const categories = ['Áo', 'Quần', 'Váy', 'Áo khoác', 'Phụ kiện'];

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (image) => <Image src={image} width={60} />,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
    message.success('Đã xóa sản phẩm');
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSubmit = (values) => {
    if (editingProduct) {
      // Update product
      setProducts(products.map(p =>
        p.id === editingProduct.id ? { ...p, ...values } : p
      ));
      message.success('Cập nhật sản phẩm thành công');
    } else {
      // Add new product
      const newProduct = {
        id: Date.now(),
        ...values,
        image: 'https://via.placeholder.com/150',
      };
      setProducts([...products, newProduct]);
      message.success('Thêm sản phẩm thành công');
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Title level={2}>Quản lý Sản phẩm</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Thêm sản phẩm
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
        okText={editingProduct ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập giá sản phẩm"
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Số lượng tồn kho"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập số lượng"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Hình ảnh"
          >
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;

