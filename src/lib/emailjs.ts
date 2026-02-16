import emailjs from '@emailjs/browser';

type SendEmailParams = {
  full_name: string;
  email: string;
  position: string;
  department: string;
  mode: string;
  internship_type: string;
  duration: string;
};

export const sendOfferEmail = async (params: SendEmailParams): Promise<boolean> => {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS environment variables are not properly configured');
      return false;
    }

    // Set the response URL with the actual domain in production
    const responseUrl = 
      process.env.NODE_ENV === 'production'
        ? 'https://yourdomain.com/respond' // Replace with your actual domain
        : 'http://localhost:3000/respond';

    const templateParams = {
      to_email: params.email,
      to_name: params.full_name,
      full_name: params.full_name,
      email: params.email,
      position: params.position,
      department: params.department,
      mode: params.mode,
      internship_type: params.internship_type,
      duration: params.duration,
      response_url: responseUrl
    };

    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );

    return response.status === 200;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};
