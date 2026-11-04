'use server'

import { Resend } from 'resend';

export async function sendEmail(formData: FormData) {
  try {
    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const message = formData.get('message')?.toString() || '';
    
    // Validate inputs
    if (!name || !email || !message) {
      return { 
        success: false, 
        error: 'Please fill out all fields' 
      };
    }
    
    // Set RESEND_API_KEY in the hosting environment. Created here rather than at
    // the top of the file because Resend throws without a key, which would take
    // down the whole action instead of showing this message.
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set, so the contact form cannot send');
      return {
        success: false,
        error: "Couldn't send your message. Please email me directly instead.",
      };
    }
    const resend = new Resend(apiKey);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // Use verified domain in production
      to: 'jakobbackhouse@gmail.com', // Your email address
      replyTo: email,
      subject: `New message from ${name} via portfolio site`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      // You can also use HTML content with:
      // html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
    });
    
    if (error) {
      console.error('Error sending email via Resend:', error);
      return { 
        success: false, 
        error: 'Failed to send message. Please try again.' 
      };
    }
    
    console.log('Email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: 'Failed to send message. Please try again.' 
    };
  }
} 