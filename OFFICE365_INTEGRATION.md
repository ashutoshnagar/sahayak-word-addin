# Sahayak - Office 365 Online Integration Guide

## 🚀 Step-by-Step Integration Process

### Step 1: Deploy to Public URL (Vercel)
Currently deploying... Once complete, you'll get a URL like:
```
https://sahayak-word-addin-[unique-id].vercel.app
```

### Step 2: Update Manifest with Production URLs

After deployment, update these URLs in `public/manifest.xml`:

```xml
<!-- Replace localhost URLs with your Vercel URL -->
<DefaultSettings>
    <SourceLocation DefaultValue="https://your-sahayak-url.vercel.app/taskpane.html" />
</DefaultSettings>

<bt:Urls>
    <bt:Url id="Commands.Url" DefaultValue="https://your-sahayak-url.vercel.app/commands.html" />
    <bt:Url id="Taskpane.Url" DefaultValue="https://your-sahayak-url.vercel.app/taskpane.html" />
</bt:Urls>

<bt:Images>
    <bt:Image id="Icon.16x16" DefaultValue="https://your-sahayak-url.vercel.app/assets/sahayak-16.png" />
    <bt:Image id="Icon.32x32" DefaultValue="https://your-sahayak-url.vercel.app/assets/sahayak-32.png" />
    <bt:Image id="Icon.80x80" DefaultValue="https://your-sahayak-url.vercel.app/assets/sahayak-80.png" />
</bt:Images>
```

### Step 3: Sideload in Office 365 Online

#### Method A: Direct Sideloading (Recommended)

1. **Open Word Online**:
   - Go to https://office.com
   - Sign in with your Microsoft account
   - Open Word Online

2. **Access Add-ins**:
   - Click `Insert` tab in the ribbon
   - Click `Add-ins` → `Get Add-ins`
   - Click `Upload My Add-in`

3. **Upload Manifest**:
   - Click `Browse...` 
   - Select your updated `manifest.xml` file
   - Click `Upload`

4. **Activate Sahayak**:
   - Sahayak should appear in the ribbon as "सहायक"
   - Click to open the task pane

#### Method B: Via Admin Center (Enterprise)

1. **Microsoft 365 Admin Center**:
   - Go to https://admin.microsoft.com
   - Navigate to `Settings` → `Integrated apps`
   - Click `Upload custom apps`

2. **Deploy Organization-wide**:
   - Upload the manifest.xml
   - Set deployment scope (All users/Specific groups)
   - Configure permissions

### Step 4: Test in Office 365 Online

1. **Open a Word Document Online**
2. **Look for Sahayak** in the Home ribbon
3. **Click "Open Sahayak"** to launch the task pane
4. **Test Core Features**:
   - Click "Scan Document"
   - Verify highlighting works
   - Test error cards and auto-fix

## 🔧 Troubleshooting Common Issues

### Issue 1: Add-in Not Loading
**Solution**: Check browser console for errors
- Press F12 → Console tab
- Look for CORS or SSL certificate errors

### Issue 2: Manifest Validation Errors
**Solution**: Validate manifest online
- Use Microsoft's Manifest Validator
- Check all URLs are HTTPS and accessible

### Issue 3: Office.js Not Working
**Solution**: Ensure proper initialization
- Check Office.js is loaded before our code
- Verify Office.onReady() is called

### Issue 4: CORS Errors
**Solution**: Our Vercel config handles this
- Headers are properly set in vercel.json
- X-Frame-Options allows embedding

## 📱 Cross-Platform Compatibility

### ✅ Supported Platforms
- **Office 365 Online** (Primary target)
- **Word Desktop** (Windows/Mac)
- **Word Mobile** (iOS/Android - limited)

### ⚠️ Platform-Specific Notes
- **Online**: Full functionality
- **Desktop**: May need additional permissions
- **Mobile**: Limited UI space

## 🔐 Security & Permissions

### Required Permissions
```xml
<Permissions>ReadWriteDocument</Permissions>
```

### Security Features
- **HTTPS only**: All communications encrypted
- **No data transmission**: Client-side only processing
- **Temporary highlighting**: No permanent document changes

## 📊 Distribution Options

### Option 1: Direct Sideloading
- **Best for**: Testing, personal use
- **Process**: Manual upload of manifest.xml
- **Scope**: Individual users

### Option 2: SharePoint App Catalog
- **Best for**: Organizational deployment
- **Process**: Deploy via SharePoint admin
- **Scope**: Organization-wide

### Option 3: Microsoft AppSource
- **Best for**: Public distribution
- **Process**: Submit for Microsoft review
- **Scope**: Global marketplace

### Option 4: Centralized Deployment
- **Best for**: Enterprise control
- **Process**: Microsoft 365 Admin Center
- **Scope**: Managed deployment

## 🚀 Quick Start Commands

```bash
# 1. Deploy to production
npx vercel --prod

# 2. Update manifest URLs with your production URL

# 3. Test locally first
npm run dev

# 4. Sideload in Office 365 Online
# Upload manifest.xml via Insert → Add-ins → Upload My Add-in
```

## 🎯 Next Steps After Integration

1. **Test thoroughly** with real audit documents
2. **Gather user feedback** on validation rules
3. **Monitor performance** in different browsers
4. **Plan rollout strategy** for your organization
5. **Consider AppSource submission** for wider distribution

---

**Sahayak is designed to work seamlessly in Office 365 Online with full Grammarly-like functionality!**
