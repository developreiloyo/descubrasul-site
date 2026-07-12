from django.contrib.auth.tokens import PasswordResetTokenGenerator


class DescubraSulPasswordResetTokenGenerator(PasswordResetTokenGenerator):
    """
    Custom token generator that includes reset_token_version in the hash.

    Django's default generator uses (pk, password, last_login, timestamp) to build
    the HMAC hash.  Two tokens generated at different moments for the same user are
    BOTH valid until they expire, because none of those values changes between
    requests.

    By including reset_token_version in the hash we ensure that every call to
    PasswordResetRequestView increments the version, which changes the expected hash
    and therefore invalidates all previously issued tokens for that user.
    """

    def _make_hash_value(self, user, timestamp):
        # login_timestamp handling mirrors Django's default implementation.
        login_timestamp = (
            ""
            if user.last_login is None
            else user.last_login.replace(microsecond=0, tzinfo=None)
        )
        return (
            f"{user.pk}"
            f"{user.password}"
            f"{login_timestamp}"
            f"{timestamp}"
            f"{user.reset_token_version}"
        )


# Module-level singleton — import this in views and tests.
password_reset_token_generator = DescubraSulPasswordResetTokenGenerator()
