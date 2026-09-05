const authFlowConfig = {
  version: '1.0.0',
  questions: [
    {
      id: 'flow_type',
      title: 'Welcome',
      subtitle: "Let's build your creator profile.",
      type: 'choice',
      options: [
        { label: 'Continue to Register', value: 'register' },
        { label: 'Already have an account', value: 'login' }
      ]
    },
    // --- REGISTER FLOW ---
    {
      id: 'fullName',
      title: 'Personal Info',
      subtitle: "What's your full name?",
      type: 'text',
      placeholder: 'John Doe',
      required: true,
      condition: (answers) => answers.flow_type === 'register',
      validation: {
        minLength: 2,
        errorMessage: 'Please enter your full name'
      }
    },
    {
      id: 'email',
      title: 'Contact Details',
      subtitle: "What's your Email?",
      type: 'email',
      placeholder: 'you@example.com',
      required: true,
      condition: (answers) => answers.flow_type === 'register',
      validation: {
        regex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        errorMessage: 'Please enter a valid email address'
      }
    },
    {
      id: 'whatsapp',
      title: 'Direct Access',
      subtitle: "What's your WhatsApp number?",
      type: 'tel',
      placeholder: '+1 234 567 8900',
      required: true,
      condition: (answers) => answers.flow_type === 'register',
    },
    {
      id: 'platform',
      title: 'Your Stage',
      subtitle: "What's your preferred platform?",
      type: 'dropdown',
      options: ['Instagram', 'YouTube', 'Facebook', 'Kick', 'TikTok', 'Twitch', 'Custom'],
      required: true,
      condition: (answers) => answers.flow_type === 'register',
    },
    {
      id: 'age',
      title: 'Demographics',
      subtitle: "What is your age?",
      type: 'number',
      placeholder: '25',
      required: true,
      condition: (answers) => answers.flow_type === 'register',
    },
    {
      id: 'country',
      title: 'Location',
      subtitle: "Where are you based?",
      type: 'text',
      placeholder: 'United States',
      required: true,
      condition: (answers) => answers.flow_type === 'register',
    },
    {
      id: 'experience',
      title: 'Expertise',
      subtitle: "What is your experience level?",
      type: 'dropdown',
      options: ['Beginner', 'Intermediate', 'Professional', 'Agency'],
      required: true,
      condition: (answers) => answers.flow_type === 'register',
    },
    {
      id: 'social_url',
      title: 'Showcase',
      subtitle: "Link your main social media URL",
      type: 'url',
      placeholder: 'https://instagram.com/...',
      required: true,
      condition: (answers) => answers.flow_type === 'register',
    },
    {
      id: 'bio',
      title: 'Your Story',
      subtitle: "Tell us about yourself",
      type: 'textarea',
      placeholder: 'I am a creator who loves...',
      required: true,
      condition: (answers) => answers.flow_type === 'register',
    },
    {
      id: 'reg_password',
      title: 'Security',
      subtitle: "Create a strong password",
      type: 'password',
      placeholder: '••••••••',
      required: true,
      condition: (answers) => answers.flow_type === 'register',
      validation: { minLength: 8, errorMessage: 'Minimum 8 characters' }
    },
    
    // --- LOGIN FLOW ---
    {
      id: 'login_email',
      title: 'Welcome Back',
      subtitle: "What's your Email?",
      type: 'email',
      placeholder: 'you@example.com',
      required: true,
      condition: (answers) => answers.flow_type === 'login',
    },
    {
      id: 'login_password',
      title: 'Security First',
      subtitle: "Enter your Password",
      type: 'password',
      placeholder: '••••••••',
      required: true,
      condition: (answers) => answers.flow_type === 'login',
    }
  ]
};

export default authFlowConfig;
