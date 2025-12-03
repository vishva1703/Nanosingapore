# How to Test Your API Integration

## Quick Testing Methods

### Method 1: Using the Test Screen (Recommended)

1. **Add the test screen to your app:**
   - Open `app/_layout.tsx`
   - Add this line in the Stack screens:
   ```tsx
   <Stack.Screen name="examples/testApiScreen" />
   ```

2. **Navigate to the test screen:**
   - From anywhere in your app, navigate to: `/examples/testApiScreen`
   - Or add a temporary button in your login screen or me screen

3. **Run tests:**
   - Tap "Run Full Test" to test everything
   - Tap individual buttons to test specific endpoints
   - Check the results in the console and on screen

### Method 2: Test from Console (Quick Check)

Add this to any screen temporarily:

```tsx
import { testApiConnection } from '@/utils/testApi';

// In your component
useEffect(() => {
  testApiConnection();
}, []);
```

Then check your console/terminal for the test results.

### Method 3: Test from Login Screen

Add a test button to your login screen:

```tsx
import { testApiConnection } from '@/utils/testApi';

// Add this button in your login screen
<TouchableOpacity 
  onPress={async () => {
    const result = await testApiConnection();
    Alert.alert('Test Result', result.success ? '✅ API is working!' : '❌ API test failed');
  }}
>
  <Text>Test API</Text>
</TouchableOpacity>
```

### Method 4: Test a Real API Call

Try logging in with a real account:

```tsx
import { authApi } from '@/services/api';

const handleLogin = async () => {
  try {
    const response = await authApi.login({
      emailId: 'your-email@example.com'
    });
    
    if (response.success && response.data?.token) {
      console.log('✅ Login successful!');
      console.log('Token:', response.data.token);
    } else {
      console.log('❌ Login failed:', response.message);
    }
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
};
```

## What to Check

### ✅ Success Indicators:
- API URL is correct: `https://api.corangelab.com/nutrition-api/...`
- Network requests are being made
- Responses are received (even if 401/404, it means server is reachable)
- Token is stored after login
- Authenticated requests work with token

### ❌ Common Issues:
- **Network Error**: Check internet connection
- **404 Not Found**: API endpoint might be wrong
- **401 Unauthorized**: Token missing or invalid (expected for first login)
- **CORS Error**: Usually not an issue in React Native
- **Timeout**: Server might be slow or unreachable

## Testing Checklist

- [ ] API base URL is correct
- [ ] Login endpoint works
- [ ] Token is stored after login
- [ ] Authenticated endpoints work with token
- [ ] Error handling works correctly
- [ ] Storage functions work

## Quick Test Commands

Run this in your app console or add to a button:

```javascript
// Test 1: Check config
import { API_CONFIG, getApiUrl } from '@/utils/apiConfig';
console.log('Base URL:', API_CONFIG.BASE_URL);
console.log('Login URL:', getApiUrl('/auth/login'));

// Test 2: Test storage
import { storage } from '@/utils/storage';
await storage.setAuthToken('test-123');
const token = await storage.getAuthToken();
console.log('Token:', token);

// Test 3: Test API call
import { authApi } from '@/services/api';
const response = await authApi.login({ emailId: 'test@test.com' });
console.log('Response:', response);
```

## Need Help?

Check the console logs for detailed error messages. The test utilities will show you exactly what's working and what's not.

