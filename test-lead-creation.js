// Test script to create a lead
import axios from 'axios';

async function testLeadCreation() {
  try {
    console.log('🚀 Testing lead creation API...');

    const payload = {
      identity: {
        fullName: "John Doe",
        phone: "+1234567890",
        email: "john.doe@example.com"
      },
      profile: {
        ageGroup: "25-35",
        professions: ["Software Engineer"],
        householdSize: "3-4 members",
        annualIncomeRange: "₹15-25 LPA"
      }
    };

    console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post('http://localhost:3000/api/leads', payload);

    console.log('✅ Success! Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testLeadCreation();
