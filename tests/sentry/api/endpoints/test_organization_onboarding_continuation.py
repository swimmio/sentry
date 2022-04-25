from unittest import mock

from sentry.testutils import APITestCase


class OrganizationOnboardingContinuation(APITestCase):
    endpoint = "sentry-api-0-organization-onboarding-continuation-email"
    method = "post"

    def setUp(self):
        super().setUp()
        self.login_as(self.user)

    @mock.patch("sentry.utils.email.MessageBuilder")
    def test_basic(self, builder):
        builder.return_value.send_async = mock.Mock()
        data = {"platforms": ["javascript", "python", "flutter"]}
        self.get_success_response(self.organization.slug, status_code=202, **data)

        expected_email_args = {
            "subject": "Finish Onboarding",
            "template": "sentry/emails/requests/onboarding-continuation.txt",
            "html_template": "sentry/emails/onboarding-continuation.html",
            "type": "organization.onboarding-continuation-email",
            "context": {
                "recipient_name": self.user.get_display_name(),
                "onboarding_link": f"/onboarding/{self.organization.slug}/?referrer=onboarding_continuation-email",
                "organization_name": self.organization.name,
                "num_platforms": 3,
                "platforms": "javascript, python, and flutter",
            },
        }

        builder.assert_called_with(**expected_email_args)

    def test_validation_error(self):
        data = {"platforms": "not a list"}
        resp = self.get_error_response(self.organization.slug, status_code=400, **data)
        assert resp.data["platforms"][0].code == "not_a_list"
