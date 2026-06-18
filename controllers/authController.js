import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import sendEmail from '../utils/sendEmail.js';

export const signup = async (req, res) => {
  try {
    const { fullName, companyName, email, phone, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'User already exists and is verified' });
      } else {
        // Unverified user trying to sign up again, update their info and resend OTP
        user.fullName = fullName;
        user.companyName = companyName;
        user.phone = phone;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user = await User.create({
        fullName,
        companyName,
        email,
        phone,
        password: hashedPassword,
        otp,
        otpExpires
      });
    }

    // Send OTP via email
    const message = `Your One Time Password (OTP) for Haniya Garments registration is: ${otp}\n\nThis OTP is valid for 10 minutes.`;
    
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background-color: #0d2b4d; padding: 30px; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px;">Haniya Garments</h1>
          </div>
          <div style="padding: 40px; color: #333333;">
            <h2 style="margin-top: 0; color: #0d2b4d;">Verify Your Email</h2>
            <p style="font-size: 16px; line-height: 1.5;">Hello ${fullName},</p>
            <p style="font-size: 16px; line-height: 1.5;">Thank you for registering with Haniya Garments. Please use the following One-Time Password (OTP) to complete your verification process:</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; text-align: center; margin: 30px 0;">
              <span style="font-size: 36px; font-weight: bold; color: #0d2b4d; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #666666; margin-bottom: 0;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Haniya Garments. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Haniya Garments - Account Verification OTP',
      message,
      html: htmlTemplate
    });

    res.status(200).json({ success: true, message: 'OTP sent to email', email: user.email });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Account verified successfully' });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: 'Please verify your email before logging in' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Logged in successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        companyName: user.companyName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const message = `Your password reset OTP for Haniya Garments is: ${otp}\n\nThis OTP is valid for 10 minutes.\nIf you did not request this, please ignore this email.`;
    
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background-color: #0d2b4d; padding: 30px; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px;">Haniya Garments</h1>
          </div>
          <div style="padding: 40px; color: #333333;">
            <h2 style="margin-top: 0; color: #0d2b4d;">Password Reset Request</h2>
            <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.5;">We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; text-align: center; margin: 30px 0;">
              <span style="font-size: 36px; font-weight: bold; color: #0d2b4d; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #666666; margin-bottom: 0;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Haniya Garments. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Haniya Garments - Password Reset',
      message,
      html: htmlTemplate
    });

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
