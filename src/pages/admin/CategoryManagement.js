import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Áo',
      description: 'Các loại áo thời trang',
      productCount: 45,
      status: 'active',
    },
    {
      id: 2,
      name: 'Quần',
      description: 'Quần các loại',
      productCount: 38,
      status: 'active',
    },
    {
      id: 3,
      name: 'Váy',
      description: 'Váy đầm nữ',
      productCount: 25,
      status: 'active',
    },
    {
      id: 4,
      name: 'Áo khoác',
      description: 'Áo khoác thời trang',
      productCount: 12,
      status: 'active',
    },
    {
      id: 5,
      name: 'Phụ kiện',
      description: 'Phụ kiện thời trang',
      productCount: 5,
      status: 'inactive',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'productCount',
      key: 'productCount',
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
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
            title="Bạn có chắc muốn xóa danh mục này?"
            description="Xóa danh mục sẽ ảnh hưởng đến các sản phẩm thuộc danh mục này."
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

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(c => c.id !== id));
    message.success('Đã xóa danh mục');
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSubmit = (values) => {
    if (editingCategory) {
      // Update category
      setCategories(categories.map(c =>
        c.id === editingCategory.id ? { ...c, ...values } : c
      ));
      message.success('Cập nhật danh mục thành công');
    } else {
      // Add new category
      const newCategory = {
        id: Date.now(),
        ...values,
        productCount: 0,
        status: 'active',
      };
      setCategories([...categories, newCategory]);
      message.success('Thêm danh mục thành công');
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Title level={2}>Quản lý Danh mục</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Thêm danh mục
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={500}
        okText={editingCategory ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục!' },
              { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả danh mục" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;

