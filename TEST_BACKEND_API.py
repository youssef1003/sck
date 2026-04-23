#!/usr/bin/env python3
"""
Test script to verify backend API functionality
Run this to test if the backend is working correctly
"""

import requests
import json

# Configuration
API_URL = "https://sck-production.up.railway.app"
ADMIN_EMAIL = "admin@sck.com"
ADMIN_PASSWORD = "scq2025"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_login():
    """Test admin login"""
    print("🔍 Testing admin login...")
    try:
        response = requests.post(f"{API_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful")
            print(f"   User: {data['user']['full_name']} ({data['user']['role']})")
            return data['access_token']
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_admin_stats(token):
    """Test admin stats endpoint"""
    print("🔍 Testing admin stats...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/api/admin/stats", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin stats working")
            stats = data['data']
            print(f"   Users: {stats['users']}")
            print(f"   Bookings: {stats['bookings']}")
            print(f"   Contacts: {stats['contacts']}")
            print(f"   Blog Posts: {stats['blog_posts']}")
            return True
        else:
            print(f"❌ Admin stats failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Admin stats error: {e}")
        return False

def test_admin_users(token):
    """Test admin users endpoint"""
    print("🔍 Testing admin users...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/api/admin/users", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin users working")
            print(f"   Total users: {data['count']}")
            if data['data']:
                print(f"   First user: {data['data'][0]['full_name']} ({data['data'][0]['email']})")
            return True
        else:
            print(f"❌ Admin users failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Admin users error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("🚀 SCK Backend API Test Suite")
    print("=" * 50)
    
    # Test health
    if not test_health():
        print("\n❌ Backend is not responding. Check Railway deployment.")
        return
    
    # Test login
    token = test_login()
    if not token:
        print("\n❌ Login failed. Check admin credentials in database.")
        return
    
    # Test admin endpoints
    stats_ok = test_admin_stats(token)
    users_ok = test_admin_users(token)
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    print(f"Health Check: {'✅ PASS' if True else '❌ FAIL'}")
    print(f"Admin Login: {'✅ PASS' if token else '❌ FAIL'}")
    print(f"Admin Stats: {'✅ PASS' if stats_ok else '❌ FAIL'}")
    print(f"Admin Users: {'✅ PASS' if users_ok else '❌ FAIL'}")
    
    if all([token, stats_ok, users_ok]):
        print("\n🎉 All tests passed! Backend is working correctly.")
        print("\n📝 Next steps:")
        print("   1. Run the MISSING_TABLES_MIGRATION.sql in Supabase")
        print("   2. Test the frontend admin dashboard")
        print("   3. Verify all admin functions work")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        if not stats_ok:
            print("   - Run MISSING_TABLES_MIGRATION.sql to fix stats")
        if not users_ok:
            print("   - Check database permissions and table structure")

if __name__ == "__main__":
    main()