# 🛡️ CyberGuard AI

### Think before you click.

CyberGuard AI is an AI-powered cybersecurity awareness platform designed to help everyday users identify potential phishing messages, scams, suspicious links, and other common cyber threats.

The goal is simple: make cybersecurity easier to understand so users can recognize warning signs and make safer decisions before clicking links or sharing sensitive information.

## 🚀 Key Features

### 🔍 Is This Safe? – AI Analyzer
Paste an email, SMS, WhatsApp message, social media message, or other suspicious content and let CyberGuard AI analyze it.

The analyzer provides:

- Risk score
- Security verdict
- Threat type
- AI confidence level
- Suspicious indicators
- Simple explanation
- Recommended actions
- Safer alternative

### 🔐 Password Strength Checker
Check password strength locally and receive feedback based on password length and security requirements.

**Passwords are not sent to the AI analyzer or stored in the application's history.**

### 🛡️ Cyber Safety Checkup
A quick cybersecurity self-assessment that helps users review important security habits such as:

- Strong passwords
- Multi-factor authentication
- Software updates
- Awareness of suspicious links

### 📚 Learn
Simple cybersecurity awareness content designed to help users understand common threats and safer online practices.

### 🧠 Cybersecurity Quiz
An interactive quiz that helps users test their knowledge of common cybersecurity situations.

### 📜 History
Users can review previous analysis results using locally stored risk metadata.

### 📱 Responsive Design
CyberGuard AI is designed to work across desktop and mobile devices.

## 🤖 AI Technology

CyberGuard AI uses **Google Gemini** to analyze suspicious messages and identify potential cybersecurity risks.

The AI analysis looks for indicators associated with threats such as:

- Phishing
- Smishing
- Banking scams
- Job scams
- Prize scams
- Impersonation
- Social engineering
- Credential theft
- Suspicious URLs
- Malware indicators

CyberGuard AI is an awareness and decision-support tool. It does **not guarantee that a message or link is safe or malicious**.

## 🏗️ Technology Stack

- Next.js
- TypeScript
- Tailwind CSS
- Google Gemini API
- Vercel
- GitHub
- Browser Local Storage

## 🔄 How It Works

```text
User enters suspicious message
          ↓
CyberGuard AI Analyzer
          ↓
Next.js API Route
          ↓
Google Gemini
          ↓
Structured Security Analysis
          ↓
Risk Score + Warning Signs + Recommendations
