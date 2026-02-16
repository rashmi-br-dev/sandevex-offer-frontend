'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import {
    Button,
    Table,
    Tag,
    Modal,
    Descriptions,
    Divider,
    Space,
    Typography,
    Avatar,
    TablePaginationConfig,
    Input,
    Dropdown,
    MenuProps,
    message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import {
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    LinkOutlined,
    SendOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    SearchOutlined,
    FilterOutlined
} from '@ant-design/icons';
import { toast } from 'sonner';
import { OFFER_EMAIL_TEMPLATE, EMAIL_DEFAULTS } from '@/constants/emailTemplates';

const { Title, Text } = Typography;

interface Student {
    _id: string;
    fullName: string;
    email: string;
    mobile: string;
    cityState: string;
    address: string;
    collegeName: string;
    degree: string;
    branch: string;
    yearOfStudy: string;
    preferredDomain: string;
    technicalSkills: string[];
    priorExperience: string;
    portfolioUrl: string;
    whySandevex: string;
    declaration: string;
    assignmentSent: boolean;
    sentAt?: Date | { $date: string };
    createdAt: Date | { $date: string };
    updatedAt: Date | { $date: string };
    __v?: number;
}

export default function CandidatesTable() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [offerStatuses, setOfferStatuses] = useState<Record<string, string>>({});
    const [loadingStatuses, setLoadingStatuses] = useState<Record<string, boolean>>({});
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [sendingOffer, setSendingOffer] = useState<Record<string, boolean>>({});
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Filter students based on search text and status (for client-side filtering)
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch =
                searchText === '' ||
                student.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                student.email.toLowerCase().includes(searchText.toLowerCase()) ||
                (student.collegeName && student.collegeName.toLowerCase().includes(searchText.toLowerCase()));

            // Filter by offer status
            const matchesStatus = !statusFilter ||
                (statusFilter === 'sent' && offerStatuses[student._id]) ||
                (statusFilter === 'not-sent' && !offerStatuses[student._id]);

            return matchesSearch && matchesStatus;
        });
    }, [students, searchText, statusFilter, offerStatuses]);

    // Handle table change (pagination, filters, sorter)
    const handleTableChange = (
        newPagination: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<Student> | SorterResult<Student>[],
    ) => {
        fetchStudents(newPagination.current || 1, newPagination.pageSize || 10);
    };

    // Fetch offer status for a candidate
    const fetchOfferStatus = useCallback(async (candidateId: string) => {
        try {
            setLoadingStatuses(prev => ({ ...prev, [candidateId]: true }));
            const response = await fetch(`${apiUrl}/offers/${candidateId}/status`);

            if (response.ok) {
                const data = await response.json();
                setOfferStatuses(prev => ({
                    ...prev,
                    [candidateId]: data.status
                }));
            } else if (response.status !== 404) {
                console.error('Error fetching offer status:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching offer status:', error);
        } finally {
            setLoadingStatuses(prev => ({ ...prev, [candidateId]: false }));
        }
    }, [apiUrl]);

    // Fetch students data with pagination
    const fetchStudents = useCallback(async (page: number, pageSize: number) => {
        try {
            setLoading(true);
            console.log('Fetching students from:', `${apiUrl}/students?page=${page}&limit=${pageSize}`);

            const response = await fetch(`${apiUrl}/students?page=${page}&limit=${pageSize}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to fetch students: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('API Response:', result);

            const studentsData = result.data || [];

            console.log('Processed students data:', studentsData);

            setStudents(studentsData);
            setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: result.pagination?.total || 0
            }));

            // Fetch offer status for each student
            studentsData.forEach((student: Student) => {
                fetchOfferStatus(student._id);
            });

            setError(studentsData.length === 0 ? 'No students found' : null);
        } catch (err) {
            console.error('Error in fetchStudents:', err);
            setError(err instanceof Error ? err.message : 'Failed to load students');
        } finally {
            setLoading(false);
        }
    }, [apiUrl, fetchOfferStatus]);

    // Initial fetch and EmailJS initialization
    useEffect(() => {
        fetchStudents(1, 10);

        // Initialize EmailJS
        emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!);
    }, []);

    const handleSendOffer = async (studentId: string) => {
        try {
            console.log('🚀 Starting send offer process for student:', studentId);
            setSendingOffer(prev => ({ ...prev, [studentId]: true }));

            const student = students.find(s => s._id === studentId);
            if (!student) {
                console.error('❌ Student not found:', studentId);
                message.error('Student not found');
                return;
            }

            console.log('✅ Found student:', student);

            // Check if EmailJS environment variables are configured
            const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
            const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
            const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

            console.log('📧 EmailJS Config:', {
                serviceId: serviceId ? '✅ Set' : '❌ Missing',
                templateId: templateId ? '✅ Set' : '❌ Missing',
                publicKey: publicKey ? '✅ Set' : '❌ Missing'
            });

            if (!serviceId || !templateId || !publicKey) {
                throw new Error('EmailJS configuration is missing. Please check your environment variables.');
            }

            // Prepare email template parameters for EmailJS
            const templateParams = {
                to_email: student.email,
                full_name: student.fullName,
                email: student.email,
                position: EMAIL_DEFAULTS.position,
                department: EMAIL_DEFAULTS.department,
                mode: EMAIL_DEFAULTS.mode,
                internship_type: EMAIL_DEFAULTS.internship_type,
                duration: EMAIL_DEFAULTS.duration,
                domain: EMAIL_DEFAULTS.domain,
                reply_to: 'noreply@sandevex.com'
            };

            console.log('📧 Email template params:', templateParams);

            // Send email using EmailJS
            console.log('📤 Sending email via EmailJS...');
            const response = await emailjs.send(
                serviceId,
                templateId,
                templateParams,
                publicKey
            );

            console.log('📧 EmailJS response:', response);

            if (response.status !== 200) {
                throw new Error(`Failed to send email via EmailJS. Status: ${response.status}`);
            }

            // Create offer record in backend
            console.log('💾 Creating offer record in backend...');
            const offerResponse = await fetch(`${apiUrl}/offers/create-record`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    candidateId: studentId,
                    email: student.email,
                    status: 'pending'
                }),
            });

            console.log('💾 Backend response status:', offerResponse.status);

            if (!offerResponse.ok) {
                const errorData = await offerResponse.json();
                console.error('❌ Backend error:', errorData);

                // Even if backend fails, email was sent successfully
                message.success(`Email sent but failed to create offer record in database`);


                // Still update the UI status
                setOfferStatuses(prev => ({
                    ...prev,
                    [studentId]: 'pending'
                }));

                return;
            }

            const offerData = await offerResponse.json();
            console.log('✅ Offer record created:', offerData);
            message.success(`Offer sent successfully to ${student.fullName}!`);


            // Update student's assignmentSent status in the UI
            setStudents(prevStudents =>
                prevStudents.map(s =>
                    s._id === studentId
                        ? { ...s, assignmentSent: true, sentAt: new Date() }
                        : s
                )
            );

            // Update offer status
            setOfferStatuses(prev => ({
                ...prev,
                [studentId]: 'pending'
            }));

            toast.success('Offer email sent successfully!');
        } catch (error) {
            console.error('❌ Error sending offer:', error);


            let errorMessage = 'Failed to send offer';
            if (error instanceof Error) {
                errorMessage = error.message;

                if (error.message.includes('551')) {
                    errorMessage = 'EmailJS service error. Please check your service ID and template ID.';
                } else if (error.message.includes('Missing recipient')) {
                    errorMessage = 'Recipient email is missing or invalid.';
                }
            }

            message.error(`❌ ${errorMessage}`);
        } finally {
            setSendingOffer(prev => ({ ...prev, [studentId]: false }));
        }
    };

    const showStudentDetails = (student: Student) => {
        setSelectedStudent(student);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const formatDate = (dateInput?: Date | { $date: string }) => {
        if (!dateInput) return 'Not sent';

        const date = typeof dateInput === 'object' && '$date' in dateInput
            ? new Date(dateInput.$date)
            : new Date(dateInput);

        return date.toLocaleString();
    };

    // Filter menu items for Offer Status column
    const statusFilterItems: MenuProps['items'] = [
        {
            key: 'all',
            label: 'All',
            onClick: () => setStatusFilter(undefined)
        },
        {
            key: 'sent',
            label: 'Sent',
            onClick: () => setStatusFilter('sent')
        },
        {
            key: 'not-sent',
            label: 'Not Sent',
            onClick: () => setStatusFilter('not-sent')
        },
    ];

    const columns: ColumnsType<Student> = [
        {
            title: 'Name',
            dataIndex: 'fullName',
            key: 'fullName',
            width: 300,
            render: (text: string, record: Student) => {
                const serialNumber = (students.findIndex(s => s._id === record._id) + 1).toString().padStart(2, '0');
                return (
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3 flex-shrink-0">
                            {serialNumber}
                        </div>
                        <div className="min-w-0">
                            <div className="font-medium truncate">{text}</div>
                            <div className="text-gray-500 text-xs truncate" title={record.email}>
                                {record.email}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'College',
            dataIndex: 'collegeName',
            key: 'college',
            width: 300,
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.collegeName}</div>
                    <div className="text-xs text-gray-500">{record.degree} in {record.branch}</div>
                </div>
            ),
        },
        {
            title: 'Contact',
            key: 'contact',
            width: 200,
            render: (_, record) => (
                <div>
                    <div className="flex items-center">
                        <PhoneOutlined className="mr-2" />
                        {record.mobile || 'N/A'}
                    </div>
                    <div className="flex items-center">
                        <EnvironmentOutlined className="mr-2" />
                        {record.cityState || 'Location not specified'}
                    </div>
                </div>
            ),
        },
        {
            title: (
                <div className="flex items-center">
                    <span className="mr-2">Offer Status</span>
                    <Dropdown
                        menu={{
                            items: statusFilterItems,
                            selectedKeys: statusFilter ? [statusFilter] : ['all']
                        }}
                        trigger={['click']}
                    >
                        <Button
                            type="text"
                            icon={<FilterOutlined />}
                            size="small"
                            className={statusFilter ? 'text-blue-500' : ''}
                        />
                    </Dropdown>
                </div>
            ),
            width: 140,
            key: 'offerStatus',
            render: (_: any, record: Student) => (
                <div className="flex items-center">
                    {loadingStatuses[record._id] ? (
                        <span>Loading...</span>
                    ) : (
                        <Tag
                            icon={
                                offerStatuses[record._id] === 'sent' || offerStatuses[record._id] === 'accepted'
                                    ? <CheckCircleOutlined />
                                    : <CloseCircleOutlined />
                            }
                            color={
                                offerStatuses[record._id] === 'accepted'
                                    ? 'success'
                                    : offerStatuses[record._id] === 'pending'
                                        ? 'processing'
                                        : 'default'
                            }
                        >
                            {offerStatuses[record._id] === 'accepted'
                                ? 'Accepted'
                                : offerStatuses[record._id] === 'pending'
                                    ? 'Pending'
                                    : 'Not Sent'}
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Student) => (
                <Space size="middle">
                    <Button
                        type="text"
                        onClick={(e) => {
                            e.stopPropagation();
                            showStudentDetails(record);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        View
                    </Button>
                    <span className="text-gray-300">|</span>
                    <Button
                        type="text"
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('📋 Send Offer clicked for:', record.fullName);
                            // Directly send the offer without opening any modal
                            handleSendOffer(record._id);
                        }}
                        disabled={!!offerStatuses[record._id]}
                        loading={sendingOffer[record._id]}
                        className={`flex items-center ${offerStatuses[record._id] ? 'text-gray-400' : 'text-blue-500 hover:text-blue-700'}`}
                    >
                        Send Offer <SendOutlined className="ml-1" />
                    </Button>
                </Space>
            ),
        }
    ];

    if (loading && students.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <Title level={3} className="mb-1">Candidate Management</Title>
                        <Text type="secondary">Manage and communicate with potential candidates</Text>
                    </div>
                    <div className="flex items-center">
                        <Input
                            placeholder="Search by name, email, or college..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-80"
                            allowClear
                        />
                    </div>
                </div>
            </div>

            <div className="relative">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <Table
                        dataSource={filteredStudents}
                        columns={columns}
                        rowKey="_id"
                        className="[&_.ant-table-container]:block [&_.ant-table-body]:block [&_.ant-table-body]:overflow-auto [&_.ant-table-thead]:sticky [&_.ant-table-thead]:top-0 [&_.ant-table-thead]:z-10 [&_.ant-table-thead]:bg-white"
                        style={{ height: '77vh' }}
                        scroll={{ y: 'calc(85vh - 170px)' }}
                        onChange={handleTableChange}
                        onRow={(record) => ({
                            onClick: () => showStudentDetails(record),
                            className: 'cursor-pointer hover:bg-gray-50',
                        })}
                        pagination={{
                            ...pagination,
                            position: ['bottomRight'],
                            className: 'bg-white py-2 px-4 border-t border-gray-200 m-0 sticky bottom-0',
                            style: { margin: 0 },
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} candidates`,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100']
                        }}
                        loading={loading}
                        locale={{
                            emptyText: searchText || statusFilter ? (
                                <div className="py-12 text-center">
                                    <div className="text-4xl mb-4">🔍</div>
                                    <Title level={4} className="mb-2">No Matching Candidates</Title>
                                    <Text type="secondary">Try adjusting your search or filter criteria</Text>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="text-4xl mb-4">📋</div>
                                    <Title level={4} className="mb-2">No Candidates Found</Title>
                                    <Text type="secondary">When candidates apply, they'll appear here.</Text>
                                </div>
                            )
                        }}
                    />
                </div>
            </div>

            {/* Student Details Modal - Only for viewing details, not for sending offers */}
            <Modal
                title="Candidate Details"
                open={isModalVisible}
                onCancel={handleCancel}
                centered
                footer={[
                    <Button key="close" onClick={handleCancel}>
                        Close
                    </Button>,
                    selectedStudent?.portfolioUrl && (
                        <Button
                            key="portfolio"
                            icon={<LinkOutlined />}
                            href={selectedStudent.portfolioUrl}
                            target="_blank"
                        >
                            View Portfolio
                        </Button>
                    )
                ]}
                width={800}
                styles={{
                    body: {
                        maxHeight: '70vh',
                        overflowY: 'auto',
                        padding: '20px 24px'
                    }
                }}
            >
                {selectedStudent && (
                    <div className="mt-4">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start">
                                <Avatar
                                    size={64}
                                    icon={<UserOutlined />}
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.fullName)}&size=128&background=1890ff&color=fff`}
                                    className="mr-4"
                                />
                                <div>
                                    <Title level={4} className="mb-1">{selectedStudent.fullName}</Title>
                                    <div className="flex items-center text-gray-500 mb-2">
                                        <MailOutlined className="mr-2" />
                                        {selectedStudent.email}
                                    </div>
                                    <div className="flex items-center text-gray-500 mb-2">
                                        <PhoneOutlined className="mr-2" />
                                        {selectedStudent.mobile || 'N/A'}
                                    </div>
                                    <div className="flex items-center text-gray-500">
                                        <EnvironmentOutlined className="mr-2" />
                                        {selectedStudent.cityState || 'Location not specified'}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Tag
                                    icon={
                                        offerStatuses[selectedStudent._id] === 'sent'
                                            ? <CheckCircleOutlined />
                                            : <CloseCircleOutlined />
                                    }
                                    color={
                                        offerStatuses[selectedStudent._id] === 'sent'
                                            ? 'success'
                                            : 'default'
                                    }
                                >
                                    {offerStatuses[selectedStudent._id] === 'sent'
                                        ? 'Offer Sent'
                                        : 'Pending'}
                                </Tag>
                            </div>
                        </div>

                        {/* Education Section */}
                        <Divider />
                        <Title level={5}>Education</Title>
                        <Descriptions column={2} className="mb-4">
                            <Descriptions.Item label="College">{selectedStudent.collegeName}</Descriptions.Item>
                            <Descriptions.Item label="Degree">{selectedStudent.degree}</Descriptions.Item>
                            <Descriptions.Item label="Branch">{selectedStudent.branch}</Descriptions.Item>
                            <Descriptions.Item label="Year of Study">{selectedStudent.yearOfStudy}</Descriptions.Item>
                        </Descriptions>

                        {/* Skills & Experience Section */}
                        <Divider />
                        <Title level={5}>Skills & Experience</Title>
                        <div className="mb-4">
                            <div className="mb-2">
                                <Text strong>Technical Skills:</Text>
                                <div className="mt-2">
                                    {selectedStudent.technicalSkills.map((skill, index) => (
                                        <Tag key={index} color="blue" className="mb-1 mr-1">
                                            {skill}
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-3">
                                <Text strong>Preferred Domain: </Text>
                                <Tag color="purple">{selectedStudent.preferredDomain}</Tag>
                            </div>
                        </div>

                        {selectedStudent.priorExperience && (
                            <div className="mb-4">
                                <Text strong>Prior Experience:</Text>
                                <div className="mt-1 p-3 bg-gray-50 rounded">
                                    <Text>{selectedStudent.priorExperience}</Text>
                                </div>
                            </div>
                        )}

                        {/* Why Sandevex Section */}
                        <Divider />
                        <Title level={5}>Why Sandevex?</Title>
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                            <Text>{selectedStudent.whySandevex}</Text>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}