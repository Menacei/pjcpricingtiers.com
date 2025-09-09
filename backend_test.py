import requests
import sys
import json
from datetime import datetime

class PJCBackendTester:
    def __init__(self, base_url="https://pjc-pricing-tiers.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:500]}")

            return success, response.json() if response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_chat_endpoint(self):
        """Test the AI chat endpoint"""
        chat_data = {
            "message": "Hello, can you tell me about your web design services?",
            "session_id": "test-session-123"
        }
        success, response = self.run_test("AI Chat Endpoint", "POST", "chat", 200, chat_data)
        
        if success:
            if 'response' in response and 'session_id' in response:
                print(f"   AI Response: {response['response'][:100]}...")
                return True
            else:
                print("❌ Chat response missing required fields")
                return False
        return False

    def test_contact_form_endpoint(self):
        """Test the contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "123-456-7890",
            "service": "professional",
            "message": "I'm interested in your Professional Business Suite package."
        }
        success, response = self.run_test("Contact Form Submission", "POST", "contact", 200, contact_data)
        
        if success:
            if 'message' in response and 'id' in response:
                print(f"   Contact ID: {response['id']}")
                return True
            else:
                print("❌ Contact response missing required fields")
                return False
        return False

    def test_affiliate_endpoints(self):
        """Test affiliate link management"""
        # Test creating affiliate link
        affiliate_data = {
            "partner_name": "Test Partner",
            "link": "https://example.com/test-partner"
        }
        success, response = self.run_test("Create Affiliate Link", "POST", "affiliate", 200, affiliate_data)
        
        if not success:
            return False
            
        affiliate_id = response.get('id')
        if not affiliate_id:
            print("❌ No affiliate ID returned")
            return False

        # Test getting affiliate links
        success, _ = self.run_test("Get Affiliate Links", "GET", "affiliate", 200)
        if not success:
            return False

        # Test tracking clicks
        success, _ = self.run_test("Track Affiliate Click", "POST", f"affiliate/{affiliate_id}/click", 200)
        return success

    def test_status_endpoints(self):
        """Test status check endpoints"""
        # Test creating status check
        status_data = {
            "client_name": "Test Client"
        }
        success, response = self.run_test("Create Status Check", "POST", "status", 200, status_data)
        
        if not success:
            return False

        # Test getting status checks
        success, _ = self.run_test("Get Status Checks", "GET", "status", 200)
        return success

def main():
    print("🚀 Starting PJC Web Designs Backend API Tests")
    print("=" * 60)
    
    tester = PJCBackendTester()
    
    # Test all endpoints
    tests = [
        ("Root API", tester.test_root_endpoint),
        ("AI Chat", tester.test_chat_endpoint),
        ("Contact Form", tester.test_contact_form_endpoint),
        ("Affiliate Links", tester.test_affiliate_endpoints),
        ("Status Checks", tester.test_status_endpoints)
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} tests...")
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} test failed with exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if failed_tests:
        print(f"❌ Failed test categories: {', '.join(failed_tests)}")
        return 1
    else:
        print("✅ All backend API tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())