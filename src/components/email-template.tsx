import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
    <p>This is a test email from AI Retail.</p>
    <p>Thank you for subscribing to our newsletter!</p>
    <p>If you have any questions or feedback, please contact us at addmin@ai.retail.com.</p>   
  </div>
);
