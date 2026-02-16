import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Spin } from 'antd';
import { MailOutlined } from '@ant-design/icons';

interface SendOfferModalProps {
  visible: boolean;
  candidate: {
    _id: string;
    fullName: string;
    email: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

const SendOfferModal: React.FC<SendOfferModalProps> = ({
  visible,
  candidate,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/offers/send-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidate._id,
          email: values.email,
          position: values.position,
          salary: values.salary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send offer');
      }

      message.success('Offer sent successfully');
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error sending offer:', error);
      message.error('Failed to send offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Send Offer to ${candidate.fullName}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ email: candidate.email }}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          name="position"
          label="Position"
          rules={[{ required: true, message: 'Please enter position' }]}
        >
          <Input placeholder="Enter position" />
        </Form.Item>

        <Form.Item
          name="salary"
          label="Salary"
          rules={[{ required: true, message: 'Please enter salary' }]}
        >
          <Input placeholder="Enter salary" />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Send Offer
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SendOfferModal;
