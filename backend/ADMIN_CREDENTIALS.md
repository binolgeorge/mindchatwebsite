# Admin Panel Credentials

## 🔐 Login Information

**Access URL:** `http://localhost:3000/admin.html`

### Default Credentials

```
Username: admin
Password: MindChat2025!Secure#Admin
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Session Management**: 24-hour token expiration
- **Rate Limiting**: Maximum 5 login attempts per 15 minutes
- **Password Protection**: Strong password requirements
- **Automatic Logout**: On invalid/expired tokens

## 🔄 Changing Credentials

To change the admin credentials:

1. Edit `backend/.env` file:
   ```env
   ADMIN_USERNAME=your_new_username
   ADMIN_PASSWORD=your_new_secure_password
   ```

2. Restart the backend server:
   ```bash
   cd backend
   node server.js
   ```

## 📝 Password Requirements

For production use, ensure your password:
- Is at least 12 characters long
- Contains uppercase and lowercase letters
- Contains numbers
- Contains special characters (!@#$%^&*)
- Is NOT a common password or dictionary word

## 🚨 Security Best Practices

1. **Change Default Credentials**: Always change default credentials before deploying to production
2. **Use Environment Variables**: Never commit passwords to version control
3. **Enable HTTPS**: Always use HTTPS in production
4. **Regular Updates**: Change passwords regularly
5. **Monitor Access**: Check audit logs for unauthorized access attempts
6. **Backup .env**: Keep a secure backup of your .env file

## 🔑 JWT Secret

The JWT secret is used to sign authentication tokens. To generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Update in `backend/.env`:
```env
JWT_SECRET=your_generated_secret_here
```

## ⚠️ Important Notes

- **Never share credentials**: Keep admin credentials confidential
- **Backup .env**: Store `.env` file securely, it's in `.gitignore`
- **Production deployment**: Use environment variables from your hosting provider
- **Two-factor authentication**: Consider implementing 2FA for additional security

## 📞 Support

If you forget your credentials:
1. Check `backend/.env` file for current credentials
2. Edit the file to set new credentials
3. Restart the backend server

---

**Remember**: Security is crucial for admin panels. Always follow best practices and keep your credentials secure!


