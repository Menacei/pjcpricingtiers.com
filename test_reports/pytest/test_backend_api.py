"""
Backend API Tests for Pat Church Website
Tests: Admin authentication, Leads endpoints, Tools page APIs, Contact form, Homepage APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://patjames-services.preview.emergentagent.com')

# Test credentials from requirements
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "pjc_secure_2025"
ADMIN_API_KEY = "pjc_admin_key_x7K9mP2wQ5vL8nR3"


class TestHealthAndBasicEndpoints:
    """Test basic API health and public endpoints"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ API root: {data}")
    
    def test_packages_endpoint(self):
        """Test packages endpoint returns pricing info"""
        response = requests.get(f"{BASE_URL}/api/packages")
        assert response.status_code == 200
        data = response.json()
        assert "packages" in data
        assert len(data["packages"]) >= 3
        print(f"✅ Packages endpoint: {len(data['packages'])} packages found")
    
    def test_blog_endpoint(self):
        """Test blog posts endpoint"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Blog endpoint: {len(data)} posts found")
    
    def test_social_platforms(self):
        """Test social platforms endpoint"""
        response = requests.get(f"{BASE_URL}/api/social/platforms")
        assert response.status_code == 200
        data = response.json()
        assert "platforms" in data
        print(f"✅ Social platforms: {len(data['platforms'])} platforms")


class TestAdminAuthentication:
    """Test admin login and authentication flow"""
    
    def test_admin_login_success(self):
        """Test successful admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "api_key" in data
        assert data["success"] == True
        print(f"✅ Admin login successful, API key received")
        return data["api_key"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with wrong credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "wrong_user",
            "password": "wrong_pass"
        })
        assert response.status_code == 401
        print(f"✅ Invalid credentials correctly rejected with 401")
    
    def test_admin_verify_with_valid_key(self):
        """Test admin verify endpoint with valid API key"""
        response = requests.get(
            f"{BASE_URL}/api/admin/verify",
            headers={"X-Admin-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        print(f"✅ Admin key verification successful")
    
    def test_admin_verify_without_key(self):
        """Test admin verify endpoint without API key returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/verify")
        assert response.status_code == 401
        print(f"✅ Missing API key correctly rejected with 401")
    
    def test_admin_verify_with_invalid_key(self):
        """Test admin verify endpoint with invalid API key returns 401"""
        response = requests.get(
            f"{BASE_URL}/api/admin/verify",
            headers={"X-Admin-Key": "invalid_key_12345"}
        )
        assert response.status_code == 401
        print(f"✅ Invalid API key correctly rejected with 401")


class TestLeadsEndpointsProtection:
    """Test that leads endpoints are properly protected"""
    
    def test_get_leads_without_auth(self):
        """Test GET /leads without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/leads")
        assert response.status_code == 401
        print(f"✅ GET /leads without auth correctly returns 401")
    
    def test_get_leads_with_auth(self):
        """Test GET /leads with valid auth returns 200"""
        response = requests.get(
            f"{BASE_URL}/api/leads",
            headers={"X-Admin-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ GET /leads with auth: {len(data)} leads found")
    
    def test_get_leads_stats_without_auth(self):
        """Test GET /leads/stats/summary without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/leads/stats/summary")
        assert response.status_code == 401
        print(f"✅ GET /leads/stats/summary without auth correctly returns 401")
    
    def test_get_leads_stats_with_auth(self):
        """Test GET /leads/stats/summary with valid auth returns 200"""
        response = requests.get(
            f"{BASE_URL}/api/leads/stats/summary",
            headers={"X-Admin-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        print(f"✅ GET /leads/stats/summary with auth: total={data.get('total', 0)}")


class TestLeadsCRUD:
    """Test leads CRUD operations with authentication"""
    
    @pytest.fixture
    def auth_headers(self):
        return {"X-Admin-Key": ADMIN_API_KEY}
    
    def test_create_lead_public(self):
        """Test creating a lead (public endpoint)"""
        lead_data = {
            "full_name": "TEST_John Doe",
            "email": "test_john@example.com",
            "phone": "555-123-4567",
            "business_type": "small_business",
            "biggest_problem": "Need a website",
            "budget_range": "1000_3000",
            "lead_source": "organic"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        assert response.status_code == 200
        data = response.json()
        # API returns lead_id instead of id
        assert "lead_id" in data or "id" in data
        lead_id = data.get("lead_id") or data.get("id")
        assert data.get("success") == True
        print(f"✅ Lead created successfully with id: {lead_id}")
        return lead_id
    
    def test_get_lead_by_id_with_auth(self, auth_headers):
        """Test getting a specific lead by ID"""
        # First create a lead
        lead_data = {
            "full_name": "TEST_Jane Smith",
            "email": "test_jane@example.com",
            "lead_source": "organic"
        }
        create_response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        assert create_response.status_code == 200
        create_data = create_response.json()
        lead_id = create_data.get("lead_id") or create_data.get("id")
        
        # Then get it
        response = requests.get(
            f"{BASE_URL}/api/leads/{lead_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == lead_id
        assert data["full_name"] == "TEST_Jane Smith"
        print(f"✅ Lead retrieved successfully: {data['full_name']}")
    
    def test_update_lead_status(self, auth_headers):
        """Test updating lead status"""
        # First create a lead
        lead_data = {
            "full_name": "TEST_Update Test",
            "email": "test_update@example.com",
            "lead_source": "organic"
        }
        create_response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        create_data = create_response.json()
        lead_id = create_data.get("lead_id") or create_data.get("id")
        
        # Update status
        update_data = {"status": "contacted", "notes": "Called on test date"}
        response = requests.patch(
            f"{BASE_URL}/api/leads/{lead_id}",
            json=update_data,
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "contacted"
        print(f"✅ Lead status updated to: {data['status']}")
    
    def test_delete_lead(self, auth_headers):
        """Test deleting a lead"""
        # First create a lead
        lead_data = {
            "full_name": "TEST_Delete Me",
            "email": "test_delete@example.com",
            "lead_source": "organic"
        }
        create_response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        lead_id = create_response.json()["id"]
        
        # Delete it
        response = requests.delete(
            f"{BASE_URL}/api/leads/{lead_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        # Verify it's deleted
        get_response = requests.get(
            f"{BASE_URL}/api/leads/{lead_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404
        print(f"✅ Lead deleted successfully")


class TestToolsEndpoints:
    """Test AI Tools page endpoints"""
    
    def test_analyze_website(self):
        """Test website analyzer endpoint"""
        response = requests.post(f"{BASE_URL}/api/tools/analyze-website", json={
            "url": "example.com",
            "analysis_type": "full"
        })
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        print(f"✅ Website analyzer: success={data.get('success')}")
    
    def test_find_leads_tool(self):
        """Test lead finder tool endpoint"""
        response = requests.post(f"{BASE_URL}/api/tools/find-leads", json={
            "location": "Kansas City",
            "industry": "restaurants"
        })
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        print(f"✅ Lead finder tool: success={data.get('success')}")
    
    def test_competitor_analysis(self):
        """Test competitor analysis endpoint"""
        response = requests.post(f"{BASE_URL}/api/tools/competitor-analysis", json={
            "competitor_url": "example.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        print(f"✅ Competitor analysis: success={data.get('success')}")
    
    def test_content_research(self):
        """Test content research endpoint"""
        response = requests.post(f"{BASE_URL}/api/tools/content-research", json={
            "topic": "web design tips",
            "industry": "technology"
        })
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        print(f"✅ Content research: success={data.get('success')}")


class TestContactForm:
    """Test contact form submission"""
    
    def test_submit_contact_form(self):
        """Test contact form submission"""
        form_data = {
            "name": "TEST_Contact User",
            "email": "test_contact@example.com",
            "phone": "555-999-8888",
            "service": "web_design",
            "message": "This is a test message from automated testing"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=form_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✅ Contact form submitted: id={data['id']}")


class TestNewsletterSubscription:
    """Test newsletter subscription endpoint"""
    
    def test_subscribe_newsletter(self):
        """Test newsletter subscription"""
        sub_data = {
            "email": "test_newsletter@example.com",
            "name": "TEST_Newsletter User",
            "interests": ["web_design", "ai"]
        }
        response = requests.post(f"{BASE_URL}/api/newsletter/subscribe", json=sub_data)
        # Could be 200 or 201 depending on implementation
        assert response.status_code in [200, 201]
        print(f"✅ Newsletter subscription: status={response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
