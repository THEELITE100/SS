const User = require('../models/User'); 
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.isVerified) return res.status(400).json({ message: 'Account is already verified.' });

    if (user.verificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    if (user.otpExpire < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      message: 'Identity verified successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during verification.' });
  }
};
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Identity already registered in the ecosystem.' });
    }

    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    const otpExpire = new Date();
    otpExpire.setMinutes(otpExpire.getMinutes() + 10);

    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: false,
      verificationOTP,
      otpExpire
    });

    const emailMessage = `
      <strong>Authentication Required</strong><br/><br/>
      Welcome to the SkillSphere ecosystem, ${name}. To verify your identity and activate your workspace, please enter the following secure code:<br/><br/>
      <span style="font-size: 24px; font-weight: 900; color: #2563eb; letter-spacing: 4px;">${verificationOTP}</span><br/><br/>
      This code will expire in exactly 10 minutes.
    `;

    await sendEmail({
      email: user.email,
      subject: 'SkillSphere: Verify Your Identity',
      message: emailMessage,
    });

    res.status(201).json({
      message: 'Account created. Verification OTP dispatched to your inbox.',
      userId: user._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during secure registration.' });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'Invalid credentials. User not found.' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'This account is missing a password. Please register a new account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during secure login.' });
  }
};