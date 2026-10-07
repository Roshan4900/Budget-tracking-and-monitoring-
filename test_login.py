import unittest
from app import app

TEST_USERNAME = "Roshan Hamal"
TEST_PASSWORD = "your_actual_password"


class LoginTestCase(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()

    def test_existing_user_valid_login(self):
        response = self.client.post("/login", data={
            "username": "Roshan Hamal",
            "password": "hamal123sdfsdfs"
        }, follow_redirects=True)

        self.assertEqual(response.status_code, 200)

        # Change "Welcome" if your dashboard displays different text
        self.assertIn(b"Welcome", response.data)

    def test_existing_user_wrong_password(self):
        response = self.client.post("/login", data={
            "username": TEST_USERNAME,
            "password": "WrongPassword123"
        }, follow_redirects=True)

        self.assertIn(
            b"Invalid username or password",
            response.data
        )

    def test_nonexistent_username(self):
        response = self.client.post("/login", data={
            "username": "this_user_does_not_exist",
            "password": "anything123"
        }, follow_redirects=True)

        self.assertIn(
            b"Invalid username or password",
            response.data
        )

    def test_empty_login(self):
        response = self.client.post("/login", data={
            "username": "",
            "password": ""
        })

        self.assertIn(response.status_code, (200, 302, 400))


if __name__ == "__main__":
    unittest.main() 