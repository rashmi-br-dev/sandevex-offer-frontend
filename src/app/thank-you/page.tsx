'use client';

import { Card, Typography, Button } from 'antd';

const { Title, Text } = Typography;

export default function ThankYouPage() {

  const openGmail = () => {
    window.open('https://mail.google.com/mail/u/0/#inbox', '_blank');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f7',
        padding: '20px'
      }}
    >
      <Card
        style={{
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          borderRadius: '14px',
          border: '1px solid #e5e5e5'
        }}
      >
        <div style={{ padding: '30px 20px' }}>

          {/* Check Icon */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '1px solid #d9d9d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 28
            }}
          >
            ✓
          </div>

          <Title level={3} style={{ marginBottom: 10 }}>
            Slot Confirmed
          </Title>

          <Text style={{ fontSize: 15, color: '#555' }}>
            Your offer letter collection appointment has been successfully booked.
            <br /><br />
            A confirmation email has been sent to your email address.
          </Text>

          {/* Open Gmail Button */}
          <div style={{ marginTop: 28 }}>
            <Button
              type="primary"
              size="large"
              onClick={openGmail}
              style={{
                borderRadius: 8,
                height: 44,
                background: '#000',
                borderColor: '#000'
              }}
            >
              Open Gmail
            </Button>
          </div>

          <Text style={{ display: 'block', marginTop: 14, color: '#999' }}>
            Please check spam folder if you don't see the mail.
          </Text>

        </div>
      </Card>
    </div>
  );
}
