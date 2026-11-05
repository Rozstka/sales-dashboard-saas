# Deployment boundaries

The Compose setup is a local portfolio demo. Before public hosting, configure TLS, exact allowed origins, secret storage, backups, migrations, monitoring and shared rate limiting. Review browser token storage and implement account recovery and token revocation.

Never reuse local demo credentials. PostgreSQL is bound to loopback; the API is proxied through nginx. Configure trusted proxies explicitly before using IP-based limits behind another proxy.

No production deployment or production readiness is claimed. See [README](../README.md) for verified local launch commands.
