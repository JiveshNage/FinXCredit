import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD

def send_notification_email(to_email: str, subject: str, message: str) -> bool:
    """
    Sends an official HTML email using the Brevo SMTP integration.
    """
    if not SMTP_SERVER or not SMTP_PASSWORD:
        print(f"[SIMULATED EMAIL] To: {to_email} | Subject: {subject} | Body: {message}")
        return True
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"FinX Credit <{SMTP_USERNAME}>"
        msg["To"] = to_email

        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #2b6cb0; text-align: center; margin-bottom: 20px;">FinX Credit Update</h2>
                <div style="font-size: 16px; color: #333; line-height: 1.6;">
                    <p>{message.replace(chr(10), '<br>')}</p>
                </div>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px;">
                    <p>This is an automated notification from the FinX Credit Underwriting Department.</p>
                </div>
            </div>
          </body>
        </html>
        """
        
        part = MIMEText(html, "html")
        msg.attach(part)
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SMTP_USERNAME, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False

def simulate_sms_call(to_phone: str, channel: str, message: str) -> bool:
    """
    Placeholder infrastructure for Twilio / MSG91.
    For now, logs the action to prevent API charges.
    """
    print("=" * 50)
    print(f"[SIMULATED {channel.upper()} DISPATCHED]")
    print(f"To: +91-{to_phone}")
    print(f"Content: {message}")
    print("=" * 50)
    return True
