import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_PUBLIC_KEY = 'sj-BevXC_06XNy5Wm';
const EMAILJS_SERVICE_ID = 'service_54zkh4f';
const BOOKING_TEMPLATE_ID = 'template_oanrrbl';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

interface EmailData {
  to: string;
  subject: string;
  templateParams?: Record<string, any>;
  templateId?: string;
}

export const sendEmail = async ({ to, subject, templateParams, templateId }: EmailData) => {
  try {
    console.log('Sending email with data:', { to, subject, templateParams, templateId });
    
    const templateData = {
      to_email: to,
      email: to, // Try both variable names
      subject: subject,
      ...templateParams
    };
    
    console.log('Final template data being sent to EmailJS:', templateData);
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId || BOOKING_TEMPLATE_ID,
      templateData
    );

    console.log('EmailJS sent:', response.status);
    return { success: true, messageId: response.status };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error);
    console.error('Failed to send email via EmailJS:', errorMessage);
    console.error('Full error details:', errorDetails);
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
};

export default { sendEmail };
