'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function RespondPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_processed' | 'expired' | 'checking'>('checking');
  const [message, setMessage] = useState('');
  const [action, setAction] = useState<'accept' | 'decline' | null>(null);
  const [offerDetails, setOfferDetails] = useState<any>(null);

  useEffect(() => {
    const email = searchParams.get('email');
    const responseStatus = searchParams.get('status') as 'accept' | 'decline' | null;

    if (responseStatus) {
      setAction(responseStatus);
    }

    const checkOfferStatus = async () => {
      if (!email) {
        setStatus('error');
        setMessage('Invalid response link. Please check your email for the correct link.');
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.replace(/\/$/, '');

        // First, check the current status of the offer
        const checkUrl = `${baseUrl}/offers/check-status?email=${encodeURIComponent(email)}`;
        console.log('Checking offer status:', checkUrl);

        const checkResponse = await fetch(checkUrl);
        const checkData = await checkResponse.json();

        console.log('Offer status check:', checkData);

        if (checkResponse.ok) {
          setOfferDetails(checkData.offer);

          // If offer is already processed
          if (checkData.offer.status !== 'pending') {
            setStatus('already_processed');
            if (checkData.offer.status === 'accepted') {
              setMessage('You have already accepted this offer. Welcome to Sandevex! Our team will contact you soon.');
            } else if (checkData.offer.status === 'declined') {
              setMessage('You have already declined this offer. Thank you for your response.');
            } else if (checkData.offer.status === 'expired') {
              setStatus('expired');
              setMessage('This offer has expired. The 24-hour response period has passed.');
            }
            return;
          }

          // If offer is pending and user clicked a button, proceed with response
          if (responseStatus) {
            await processResponse(email, responseStatus);
          } else {
            // Just viewing the page without action
            setStatus('checking');
            setMessage('Please click Accept or Decline to respond to this offer.');
          }
        } else {
          setStatus('error');
          setMessage(checkData.message || 'Unable to verify offer status. Please contact support.');
        }
      } catch (error) {
        console.error('Error checking offer status:', error);
        setStatus('error');
        setMessage('Unable to connect to the server. Please try again.');
      }
    };

    const processResponse = async (email: string, responseStatus: 'accept' | 'decline') => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.replace(/\/$/, '');
        const url = `${baseUrl}/offers/respond`; // Added /api/ prefix

        console.log('Processing response:', url);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            status: responseStatus
          }),
        });

        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
          setStatus('success');

          if (responseStatus === 'accept') {
            setMessage(
              '🎉 Congratulations! Your acceptance has been recorded. Welcome to Sandevex!\n\n' +
              'Our team will reach out to you shortly with further instructions regarding the onboarding process.'
            );
          } else {
            setMessage(
              'Thank you for letting us know. We appreciate your response and wish you the best in your future endeavors.'
            );
          }

          // Update URL to remove query parameters (prevents re-submission on refresh)
          window.history.replaceState({}, '', '/respond');

        } else {
          if (data.message?.includes('already been processed')) {
            setStatus('already_processed');
            setMessage('This offer has already been processed.');
          } else if (data.message?.includes('expired')) {
            setStatus('expired');
            setMessage('This offer has expired. The 24-hour response period has passed.');
          } else {
            setStatus('error');
            setMessage(data.message || 'An error occurred. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error processing response:', error);
        setStatus('error');
        setMessage('Unable to process your response. Please try again.');
      }
    };

    checkOfferStatus();
  }, [searchParams, router]);

  const getStatusStyle = () => {
    switch (status) {
      case 'success':
        return action === 'accept'
          ? 'bg-green-50 border border-green-200'
          : 'bg-blue-50 border border-blue-200';
      case 'error':
        return 'bg-red-50 border border-red-200';
      case 'already_processed':
        return 'bg-yellow-50 border border-yellow-200';
      case 'expired':
        return 'bg-orange-50 border border-orange-200';
      case 'checking':
        return 'bg-gray-50 border border-gray-200';
      default:
        return 'bg-gray-50 border border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return action === 'accept' ? (
          <svg className="h-12 w-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-12 w-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-12 w-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'already_processed':
        return (
          <svg className="h-12 w-12 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'expired':
        return (
          <svg className="h-12 w-12 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 4a4 4 0 00-4 4v3a1 1 0 001 1h6a1 1 0 001-1V8a4 4 0 00-4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="animate-spin h-12 w-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return action === 'accept' ? 'Welcome to Sandevex! 🎉' : 'Response Recorded';
      case 'error':
        return 'Something Went Wrong';
      case 'already_processed':
        return 'Already Responded';
      case 'expired':
        return 'Offer Expired';
      case 'checking':
        return 'Respond to Your Offer';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center">
          {/* Logo or Brand */}
          <div className="mb-8">
            <img
              src="/2.svg"
              alt="Sandevex Logo"
              className="h-40 mx-auto"
              onError={(e) => {
                // Fallback to text if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          </div>

          {/* Status Card */}
          <div className={`mt-6 p-8 rounded-xl shadow-sm ${getStatusStyle()}`}>
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0 mb-4">
                {getStatusIcon()}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {getStatusTitle()}
              </h3>
              <div className="space-y-4">
                <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                  {message}
                </p>

                {/* Show offer details if available */}
                {offerDetails && status === 'checking' && (
                  <div className="text-sm text-gray-500">
                    <p>Offer sent: {new Date(offerDetails.sentAt).toLocaleDateString()}</p>
                    <p>Expires: {new Date(offerDetails.expiresAt).toLocaleDateString()}</p>
                    <p className="mt-2 text-xs">Expires in: {Math.round((new Date(offerDetails.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60))} hours</p>
                  </div>
                )}

                {/* Show buttons only when checking and offer is pending */}
                {status === 'checking' && offerDetails?.status === 'pending' && (
                  <div className="flex gap-4 justify-center mt-4">
                    <button
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('status', 'accept');
                        window.location.href = url.toString();
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Accept Offer
                    </button>
                    <button
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('status', 'decline');
                        window.location.href = url.toString();
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {/* Close button for all states */}
                {(status === 'success' || status === 'already_processed' || status === 'expired' || status === 'error') && (
                  <button
                    onClick={() => window.close()}
                    className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close This Window
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(status === 'error' || status === 'expired') && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Need help? Contact our hiring team at{' '}
                <a href="mailto:hiring@sandevex.com" className="text-blue-600 hover:underline">
                  hiring@sandevex.com
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}