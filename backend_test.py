import requests
import sys
import json
from datetime import datetime

class SmartMealAPITester:
    def __init__(self, base_url="https://recipe-genius-147.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_auth_me_without_token(self):
        """Test auth/me without token (should fail)"""
        return self.run_test("Auth Me (No Token)", "GET", "auth/me", 401)

    def test_pantry_operations(self):
        """Test pantry CRUD operations"""
        print("\n📦 Testing Pantry Operations...")
        
        # Get pantry
        success, pantry = self.run_test("Get Pantry", "GET", "pantry", 200)
        if not success:
            return False
        
        # Add ingredient
        ingredient_data = {
            "name": "Test Tomatoes",
            "quantity": "2",
            "unit": "kg",
            "category": "vegetables"
        }
        success, new_ingredient = self.run_test("Add Ingredient", "POST", "pantry/ingredient", 200, ingredient_data)
        if not success:
            return False
        
        ingredient_id = new_ingredient.get('ingredient_id')
        if not ingredient_id:
            print("❌ No ingredient_id returned")
            return False
        
        # Update ingredient
        update_data = {
            "name": "Updated Tomatoes",
            "quantity": "3",
            "unit": "kg",
            "category": "vegetables"
        }
        success, _ = self.run_test("Update Ingredient", "PUT", f"pantry/ingredient/{ingredient_id}", 200, update_data)
        if not success:
            return False
        
        # Delete ingredient
        success, _ = self.run_test("Delete Ingredient", "DELETE", f"pantry/ingredient/{ingredient_id}", 200)
        return success

    def test_family_operations(self):
        """Test family CRUD operations"""
        print("\n👨‍👩‍👧‍👦 Testing Family Operations...")
        
        # Get family
        success, family = self.run_test("Get Family", "GET", "family", 200)
        if not success:
            return False
        
        # Add family member
        member_data = {
            "name": "Test Dad",
            "dietary_restriction": "non-veg",
            "spice_tolerance": "hot",
            "preferences": ["high-protein"]
        }
        success, new_member = self.run_test("Add Family Member", "POST", "family/member", 200, member_data)
        if not success:
            return False
        
        member_id = new_member.get('member_id')
        if not member_id:
            print("❌ No member_id returned")
            return False
        
        # Update family member
        update_data = {
            "name": "Updated Dad",
            "dietary_restriction": "veg",
            "spice_tolerance": "medium",
            "preferences": ["high-protein", "low-carb"]
        }
        success, _ = self.run_test("Update Family Member", "PUT", f"family/member/{member_id}", 200, update_data)
        if not success:
            return False
        
        # Delete family member
        success, _ = self.run_test("Delete Family Member", "DELETE", f"family/member/{member_id}", 200)
        return success

    def test_ai_endpoints(self):
        """Test AI endpoints (without actual file upload)"""
        print("\n🤖 Testing AI Endpoints...")
        
        # Test recipe suggestions
        query_data = {
            "query": "Quick dinner with vegetables"
        }
        success, recipes = self.run_test("AI Recipe Suggestions", "POST", "ai/suggest-recipes", 200, query_data)
        if success and recipes.get('recipes'):
            print(f"   Found {len(recipes['recipes'])} recipes")
        
        return success

def create_test_user_and_session():
    """Create test user and session using MongoDB"""
    import subprocess
    import time
    
    print("\n🔧 Creating test user and session...")
    
    timestamp = int(time.time())
    user_id = f"test-user-{timestamp}"
    session_token = f"test_session_{timestamp}"
    
    mongo_script = f"""
use('test_database');
var userId = '{user_id}';
var sessionToken = '{session_token}';
db.users.insertOne({{
  user_id: userId,
  email: 'test.user.{timestamp}@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
}});
db.user_sessions.insertOne({{
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
}});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"""
    
    try:
        result = subprocess.run(['mongosh', '--eval', mongo_script], 
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print("✅ Test user and session created successfully")
            return user_id, session_token
        else:
            print(f"❌ Failed to create test user: {result.stderr}")
            return None, None
    except Exception as e:
        print(f"❌ Error creating test user: {str(e)}")
        return None, None

def cleanup_test_data():
    """Clean up test data"""
    print("\n🧹 Cleaning up test data...")
    
    mongo_script = """
use('test_database');
db.users.deleteMany({email: /test\.user\./});
db.user_sessions.deleteMany({session_token: /test_session/});
db.pantry.deleteMany({user_id: /test-user-/});
db.family.deleteMany({user_id: /test-user-/});
print('Test data cleaned up');
"""
    
    try:
        result = subprocess.run(['mongosh', '--eval', mongo_script], 
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print("✅ Test data cleaned up successfully")
        else:
            print(f"❌ Failed to clean up: {result.stderr}")
    except Exception as e:
        print(f"❌ Error cleaning up: {str(e)}")

def main():
    print("🍽️ SmartMeal API Testing Suite")
    print("=" * 50)
    
    # Create test user and session
    user_id, session_token = create_test_user_and_session()
    if not user_id or not session_token:
        print("❌ Cannot proceed without test user")
        return 1
    
    # Initialize tester
    tester = SmartMealAPITester()
    tester.user_id = user_id
    tester.session_token = session_token
    
    # Run tests
    print(f"\n🔑 Using session token: {session_token[:20]}...")
    
    # Test basic endpoints
    tester.test_root_endpoint()
    tester.test_auth_me_without_token()
    
    # Test with authentication
    success, user_data = tester.run_test("Auth Me (With Token)", "GET", "auth/me", 200)
    if not success:
        print("❌ Authentication failed, stopping tests")
        cleanup_test_data()
        return 1
    
    # Test CRUD operations
    pantry_success = tester.test_pantry_operations()
    family_success = tester.test_family_operations()
    ai_success = tester.test_ai_endpoints()
    
    # Print results
    print(f"\n📊 Test Results:")
    print(f"   Tests run: {tester.tests_run}")
    print(f"   Tests passed: {tester.tests_passed}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Detailed results
    print(f"\n📋 Feature Results:")
    print(f"   ✅ Authentication: Working" if success else "   ❌ Authentication: Failed")
    print(f"   ✅ Pantry Operations: Working" if pantry_success else "   ❌ Pantry Operations: Failed")
    print(f"   ✅ Family Operations: Working" if family_success else "   ❌ Family Operations: Failed")
    print(f"   ✅ AI Endpoints: Working" if ai_success else "   ❌ AI Endpoints: Failed")
    
    # Clean up
    cleanup_test_data()
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())