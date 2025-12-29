import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageCircle, Clock, HelpCircle, QrCode, ExternalLink } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPPORT_PHONE = '8777021315';
const SUPPORT_WHATSAPP = '918777021315'; // With country code for WhatsApp
const WHATSAPP_DEEP_LINK = `https://wa.me/${SUPPORT_WHATSAPP}`;

export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Generate QR code URL using a QR code API
  // Using qrcode.tec-it.com API (free, no API key required)
  const generateQRCode = () => {
    const encodedMessage = encodeURIComponent('Hi, I need help regarding...');
    const whatsappUrl = `${WHATSAPP_DEEP_LINK}?text=${encodedMessage}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(whatsappUrl)}`;
    setQrCodeUrl(qrApiUrl);
  };

  const handleCallSupport = () => {
    window.location.href = `tel:${SUPPORT_PHONE}`;
  };

  const handleWhatsAppWeb = () => {
    const message = encodeURIComponent('Hi, I need help regarding...');
    window.open(`${WHATSAPP_DEEP_LINK}?text=${message}`, '_blank');
  };

  const handleWhatsAppMobile = () => {
    const message = encodeURIComponent('Hi, I need help regarding...');
    window.open(`${WHATSAPP_DEEP_LINK}?text=${message}`, '_blank');
  };

  // Generate QR code when modal opens
  if (open && !qrCodeUrl) {
    generateQRCode();
  }

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'If you\'ve forgotten your password, please contact support via phone or WhatsApp. We\'ll help you reset it securely.',
    },
    {
      question: 'Why is my dashboard not loading?',
      answer: 'Try refreshing the page or clearing your browser cache. If the problem persists, contact support for technical assistance.',
    },
    {
      question: 'How do I add sessions to my timetable?',
      answer: 'Go to the Timetable section, click "Add Session", fill in the details (subject, time, day), and save. You\'ll receive a notification confirmation.',
    },
    {
      question: 'Can I download videos from the Learning section?',
      answer: 'The Learning section provides embedded YouTube videos for streaming. For offline access, you can use YouTube Premium or contact support for alternatives.',
    },
    {
      question: 'How do I apply for jobs?',
      answer: 'Navigate to the Jobs section, use the search filters to find relevant positions, and click "Apply Now" on any job card. This will redirect you to the employer\'s application page.',
    },
    {
      question: 'Why am I not receiving notifications?',
      answer: 'Check your browser notification permissions. Also, ensure you\'ve created timetable sessions. If issues persist, contact support.',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Support Center
          </DialogTitle>
          <DialogDescription>
            Get instant help through phone or WhatsApp. We're here to assist you 24/7.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="contact" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="faq">FAQs</TabsTrigger>
          </TabsList>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Support
                </CardTitle>
                <CardDescription>
                  Click to call our support team directly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div>
                    <p className="text-2xl font-bold">{SUPPORT_PHONE}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
                      Available 24/7 for urgent assistance
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleCallSupport}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Now
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Common Issues We Help With:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Login and authentication issues</li>
                    <li>Dashboard errors and bugs</li>
                    <li>Quiz and assessment problems</li>
                    <li>Timetable and notification issues</li>
                    <li>Technical bugs and errors</li>
                    <li>Account and profile settings</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Phone Support:</span>
                    <span>24/7 Available</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">WhatsApp Support:</span>
                    <span>24/7 Available</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Response Time:</span>
                    <span>Within 1 hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Support
                </CardTitle>
                <CardDescription>
                  Scan the QR code or click the button to start chatting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code */}
                <div className="flex flex-col items-center p-6 bg-accent rounded-lg">
                  {qrCodeUrl && (
                    <div className="mb-4">
                      <img
                        src={qrCodeUrl}
                        alt="WhatsApp QR Code"
                        className="w-64 h-64 border-4 border-white rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Scan this QR code with your phone's camera or WhatsApp to start a chat
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleWhatsAppMobile}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Open WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleWhatsAppWeb}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      WhatsApp Web
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm font-semibold mb-2">How to Use:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Open WhatsApp on your phone</li>
                    <li>Tap the camera icon or scan the QR code above</li>
                    <li>Or click "Open WhatsApp" to start chatting directly</li>
                    <li>Send your message - we'll respond within 1 hour</li>
                  </ol>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm font-semibold mb-2">What You Can Ask:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>"I need help with my learning dashboard"</li>
                    <li>"My quiz is not loading"</li>
                    <li>"I have a technical problem"</li>
                    <li>"I can't apply to a job"</li>
                    <li>"Please guide me with the timetable section"</li>
                    <li>"How do I reset my password?"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Find quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="mt-6 p-4 bg-accent rounded-lg">
                  <p className="text-sm text-center">
                    Still have questions?{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => {
                        // Switch to contact tab
                        const contactTab = document.querySelector('[value="contact"]') as HTMLElement;
                        contactTab?.click();
                      }}
                    >
                      Contact us via phone or WhatsApp
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

