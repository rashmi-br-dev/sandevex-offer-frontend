'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table, 
  Button, 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Tag, 
  Avatar, 
  message,
  notification,
  Empty,
  Spin,
  Pagination,
  Input,
  Select
} from 'antd';

const { Title, Text } = Typography;

interface Offer {
  _id: string;
  candidateId: {
    _id: string;
    fullName: string;
    mobile: string;
  };
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  respondedAt?: string;
  sentAt: string;
  expiresAt: string;
}

export default function AppointsManagePage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [sentEmailOffers, setSentEmailOffers] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [emailSentFilter, setEmailSentFilter] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    // Check admin authentication
    const adminPassword = sessionStorage.getItem('adminPassword');
    if (adminPassword !== 'sandevex123') {
      router.push('/admin/login');
      return;
    }
    
    fetchAcceptedOffers();
  }, [router]);

  useEffect(() => {
    // Filter offers based on search and status
    let filtered = offers;

    if (searchText) {
      filtered = filtered.filter(offer => 
        offer.candidateId?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        offer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        offer.candidateId?.mobile?.includes(searchText)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    // Filter by email sent status
    if (emailSentFilter) {
      filtered = filtered.filter(offer => sentEmailOffers.has(offer._id));
    }

    setFilteredOffers(filtered);
    setCurrentPage(1);
  }, [offers, searchText, statusFilter, emailSentFilter, sentEmailOffers]);

  const fetchAcceptedOffers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers`);
      const data = await res.json();
      
      if (res.ok) {
        // Show all offers
        setOffers(data.offers);
        setFilteredOffers(data.offers);
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to fetch offers',
          placement: 'topRight'
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Server error',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendBookingEmail = async (offer: Offer) => {
    setSendingEmail(offer._id);
    
    try {
      // Import the email service dynamically to avoid SSR issues
      const { sendEmail } = await import('../../../services/emailService');
      
      // Generate booking link
      const bookingLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/candidate/book-slot?name=${encodeURIComponent(offer.candidateId.fullName || 'Candidate')}&email=${encodeURIComponent(offer.email)}&position=${encodeURIComponent('Student')}&candidateId=${offer.candidateId._id}`;

      // Send email directly via EmailJS from frontend
      await sendEmail({
        to: offer.email,
        subject: 'Book Your Offer Letter Collection Slot',
        templateParams: {
          full_name: offer.candidateId.fullName || 'Candidate', // Changed from name to full_name
          position: 'Student',
          booking_url: bookingLink,
          office_address: 'https://maps.app.goo.gl/J251RV3LQo9CwUnr9'
        },
        templateId: 'template_oanrrbl'
      });

      message.success({
        content: `Booking email sent to ${offer.candidateId.fullName || 'Candidate'} (${offer.email})`,
        duration: 3,
      });
      
      // Add to sent emails set to disable button
      setSentEmailOffers(prev => new Set(prev).add(offer._id));
    } catch (error) {
      console.error('Error sending email:', error);
      message.error({
        content: 'Failed to send email. Please check the console for details.',
        duration: 3,
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const columns = [
    {
      title: 'Candidate',
      dataIndex: 'candidateId',
      key: 'candidate',
      render: (candidateId: any) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }} size="large">
            {candidateId?.fullName?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{candidateId?.fullName || 'N/A'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{candidateId?._id}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact Information',
      key: 'contact',
      render: (_: any, record: Offer) => (
        <div>
          <div style={{ fontSize: '14px' }}>
            <div style={{ color: '#1890ff', marginBottom: '4px' }}>{record.email}</div>
            <div style={{ color: '#666' }}>{record.candidateId?.mobile || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Offer Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'accepted' ? 'green' : status === 'pending' ? 'orange' : status === 'declined' ? 'red' : 'default'}>
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Timeline',
      key: 'timeline',
      render: (_: any, record: Offer) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>Sent:</span> {new Date(record.sentAt).toLocaleDateString()}
          </div>
          {record.respondedAt && (
            <div style={{ color: '#52c41a' }}>
              <span style={{ color: '#666' }}>Responded:</span> {new Date(record.respondedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Offer) => (
        <Space>
          <Button
            type="primary"
            onClick={() => sendBookingEmail(record)}
            loading={sendingEmail === record._id}
            disabled={!record.email || sentEmailOffers.has(record._id)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              <path d="M16 8h2M12 8v2"/>
              <path d="M12 12h2"/>
              <path d="M12 16h2"/>
            </svg>
            }
          >
            {sentEmailOffers.has(record._id) ? 'Email Sent' : 'Send Email'}
          </Button>
        </Space>
      ),
    },
  ];

  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: '24px' }} bodyStyle={{ padding: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
            Manage All Offers
          </Title>
          <Text type="secondary" style={{ marginTop: '8px' }}>
            View and manage all student offers
          </Text>
        </Card>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Offers"
                value={offers.length}
                valueStyle={{ color: '#3f8600' }}
                prefix={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="With Email"
                value={offers.filter(o => o.email).length}
                valueStyle={{ color: '#1890ff' }}
                prefix={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Ready to Send"
                value={offers.length}
                valueStyle={{ color: '#722ed1' }}
                prefix={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: '24px' }} bodyStyle={{ padding: '16px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input.Search
                placeholder="Search by name, email, or phone"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                value={emailSentFilter ? 'sent' : 'all'}
                onChange={(value) => setEmailSentFilter(value === 'sent')}
                style={{ width: '100%' }}
                options={[
                  { value: 'all', label: 'All Offers' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'declined', label: 'Declined' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'sent', label: 'Booking Email Sent' }
                ]}
              />
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Button 
                onClick={fetchAcceptedOffers}
                loading={loading}
                style={{ width: '100%' }}
              >
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={paginatedOffers}
            rowKey="_id"
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>
                      No accepted offers found
                      <br />
                      <Text type="secondary">Students who accept offers will appear here</Text>
                    </span>
                  }
                />
              )
            }}
            scroll={{ x: 800 }}
          />
          
          {/* Pagination */}
          {filteredOffers.length > 0 && (
            <div style={{ 
              padding: '16px', 
              borderTop: '1px solid #f0f0f0',
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Text type="secondary">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredOffers.length)} of {filteredOffers.length} results
              </Text>
              <Pagination
                current={currentPage}
                total={filteredOffers.length}
                pageSize={pageSize}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size || 10);
                }}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
