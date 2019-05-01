# Two-factor Authentication

Two-factor authentication is an extra security layer for the user account by using another factor to log in, additionally to the common email and password.

This guide will provide a brief explanation to understand how the two-factor authentication system works.

## Table of Contents

- [Two-factor Authentication](#two-factor-authentication)
  - [Table of Contents](#table-of-contents)
    - [Enable 2FA](#enable-2fa)
      - [Create a Secret Code](#create-a-secret-code)
      - [Create Backup Codes](#create-backup-codes)
    - [Log in with 2FA](#log-in-with-2fa)
    - [Disable 2FA](#disable-2fa)
    - [Note](#note)

### Enable 2FA

To enable the two-factor authentication, the client must provide `passcode` to the api. The `passcode` is generated from the `secret_2fa_code`. The section below will explain how can we get it.

#### Create a Secret Code

The secret code is a unique 16 character alphanumeric code used to create a time-based one-time-password code (the code that invalidates for every x seconds)

To create a secret code, calling to `/me.create_secret_code` like the following structure:

```bash
curl http://localhost:4000/api/admin/me.create_secret_code \
-X POST \
-H "Accept: application/vnd.omisego.v1+json" \
-H "Authorization: OMGAdmin $(echo -n "user_id:auth_token" | base64 | tr -d '\n')" \
-H "Content-Type: application/json" \
-d '{}' \
-v -w "\n" | jq
```

The response will look similar to:

```json
{
  "version": "1",
  "success": true,
  "data": {
    "secret_2fa_code": "EDK4WLQ2A5DXYFAL",
    "object": "secret_code",
    "label": "user@example.com",
    "issuer": "OmiseGO"
  }
}
```

Next, create the two-factor qr code by using given data from the previous response.

> Try: using a web service to quickly generate the Two-factor QR Code e.g. [this](https://stefansundin.github.io/2fa-qr/)

Then scan it by the time-based one-time password (TOTP) generator app such as Authy, Google Authenticator, etc.

The 6-digits passcode should be now displayed on the application.

Next, we required to create backup codes to be used for recover the account.

#### Create Backup Codes

Backup codes are the set of codes that can also be used for two-factor authentication in case of the passcode has been lost. To create backup codes, calling to the endpoint `me.create_backup_codes` like the folowing:

```bash
curl http://localhost:4000/api/admin/me.create_backup_codes \
-X POST \
-H "Accept: application/vnd.omisego.v1+json" \
-H "Authorization: OMGAdmin $(echo -n "user_id:auth_token" | base64 | tr -d '\n')" \
-H "Content-Type: application/json" \
-d '{}' \
-v -w "\n" | jq
```

The response will look similar to:

```json
{
  "version": "1",
  "success": true,
  "data": {
    "object": "backup_codes",
    "backup_codes": [
      "44eba8a0",
      "b70fbcb5",
      "891b195f",
      "fcc6566d",
      "2508c78c",
      "7250399f",
      "ae4905db",
      "d6dd6568",
      "0a555b84",
      "1bd686ce"
    ]
  }
}
```

Finally, calling to `/me.enable_2fa` with the following request parameters:

```bash
curl http://localhost:4000/api/admin/me.enable_2fa \
-X POST \
-H "Accept: application/vnd.omisego.v1+json" \
-H "Authorization: OMGAdmin $(echo -n "user_id:auth_token" | base64 | tr -d '\n')" \
-H "Content-Type: application/json" \
-d '{
  "passcode": "103405"
}' \
-v -w "\n" | jq
```

If the `passcode` is correct, the response will be similar to:

```json
{
  "version": "1",
  "success": true,
  "data": {}
}
```

If everything is done correctly, the user should be now secure the account with the two-factor authentication successfully.

Next, we will look into how can we log in with two-factor authentication.

### Log in with 2FA

After the user has enabled the two-factor authentication successfully, the user will be need to do 2-steps login to fully obtain the authentication token which we normally use to access the authenticated apis.

First, we need to obtain the pre-authentication token from the `/admin.login`..

1. Login with email and password

```bash
curl http://localhost:4000/api/admin/admin.login \
-X POST \
-H "Accept: application/vnd.omisego.v1+json" \
-H "Content-Type: application/json" \
-d '{
  "email": "user@example.com",
  "password": "p455w0RD"
}' \
-v -w "\n" | jq
```

The response would be look similar to:

```json
{
    "version": "1",
    "success": true,
    "data": {
        "user_id": "usr_01d9m837smphv4kx7xpaxm4dxp",
        "user": {},
        "role": null,
        "pre_authentication_token": "W9Yz6v5j3h9Z2q71NSDOmt8AR5cYw_m8KcIZHUVki_0",
        "object": "pre_authentication_token",
        "master_admin": null,
        "global_role": "super_admin",
        "account_id": null,
        "account": null
    }
}
```

Second, calling to the two-factor authentication endpoint `/admin.login_2fa` by using the `pre_authentication_token` which we take from the previous step to form the authorization header, also specify the passcode which was generated by the totp authenticator app in the body like below:

2. Login with passcode (or backup_code)

```bash
curl http://localhost:4000/api/admin/admin.login_2fa \
-X POST \
-H "Accept: application/vnd.omisego.v1+json" \
-H "Authorization: OMGAdmin $(echo -n "user_id:pre_auth_token" | base64 | tr -d '\n')" \
-H "Content-Type: application/json" \
-d '{
  "passcode": "103405"
}' \
-v -w "\n" | jq
```

The response will be look similar to the previous log-in response, except the `pre_authentication_token`, which will be now a real `authentication_token`:

```json
{
    "version": "1",
    "success": true,
    "data": {
        "user_id": "usr_01d9m837smphv4kx7xpaxm4dxp",
        "user": {},
        "role": null,
        "authentication_token": "JAnlHGB3GNDt51TGZeFGoip55gRIdhnefALZHhhdSv8",
        "object": "authentication_token",
        "master_admin": null,
        "global_role": "super_admin",
        "account_id": null,
        "account": null
    }
}
```

Now, we can use the `user_id` and `authentication_token` from the response to form the valid authorization header, to be able to access the authenticated apis.

### Disable 2FA

To disable the two-factor authentication, calling to the api `/me.disable_2fa` as the following:

```bash
curl http://localhost:4000/api/admin/me.disable_2fa \
-X POST \
-H "Accept: application/vnd.omisego.v1+json" \
-H "Authorization: OMGAdmin $(echo -n "user_id:auth_token" | base64 | tr -d '\n')" \
-H "Content-Type: application/json" \
-d '{
  "passcode": "103405"
}' \
-v -w "\n" | jq
```

If the `passcode` is correct, the response will be look like as following:

```json
{
  "version": "1",
  "success": true,
  "data": {}
}
```

### Note

1. The user's authentication tokens are deleted after enabled or disabled two-factor authentication, so re-login might required.

2. `backup_code` can be used for disable and login.

3. Each `backup_code` is one-time use.

4. `pre_authentication_token` is returned only when the user has enabled two-factor authentication and log in with email and password, otherwise the  `authentication_token` is returned instead.