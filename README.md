# Sahayak - Your Intelligent Document Assistant 🚀

Sahayak (सहायक) is a Grammarly-like Word add-in that provides intelligent document compliance checking for audit reports and other business documents. It scans documents against comprehensive validation rules and provides real-time feedback with auto-fix capabilities.

## 🚀 Features

### **Current Features (Phase 1)**
- **Grammarly-style Interface**: Clean, modern UI with temporary highlighting
- **25+ Validation Rules**: Comprehensive audit report compliance checking
- **Real-time Feedback**: Instant error detection and categorization
- **Auto-fix Capabilities**: One-click fixes for common formatting issues
- **Interactive Error Cards**: Detailed explanations and suggestions
- **Categorized Results**: Critical, Warning, and Suggestion levels

### **Validation Rules Included**

#### **Font & Typography**
- Font family validation (Calibri required)
- Font size standards (Title: 20pt, Heading: 16pt, Sub-heading: 13pt, Content: 11pt)
- Line spacing requirements (1.15 throughout)

#### **Formatting Standards**
- Paragraph spacing (3pt for headings)
- Text alignment requirements
- Capitalization rules (team/policy naming, Board capitalization)
- Slash spacing requirements
- Punctuation consistency

#### **Content Validation**
- Name prefix removal (no Mr./Ms./Miss)
- Acronym usage validation
- Issue numbering sequences (H.1.1, M.1.1, L.1.1)

#### **Number & Currency**
- Number representation (1-10 in words)
- Currency formatting (INR prefix required)
- Comma usage in large numbers
- Date format validation (MMM, DD YYYY)
- Weekend closure date checking

### **Future Features (Roadmap)**
- **Phase 2**: Sahayak Chat (Document Q&A)
- **Phase 3**: Sahayak Generate (Content creation)
- **Phase 4**: Sahayak AI (Advanced analysis)

## 🛠️ Technology Stack

- **Frontend**: Office.js + HTML/CSS/JavaScript
- **Hosting**: Vercel (Static deployment)
- **Architecture**: Client-side only (no backend required)
- **Compatibility**: Microsoft Word (Desktop & Web)

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 14+ installed
- Microsoft Word (Desktop or Office 365)
- Git (for version control)

### **Local Development**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ashutoshnagar/sahayak-word-addin.git
   cd sahayak-word-addin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   The add-in will be available at `http://localhost:3000`

4. **Sideload in Word**:
   - Open Microsoft Word
   - Go to Insert > My Add-ins > Upload My Add-in
   - Upload the `manifest.xml` file from the `public` folder

### **Production Deployment**

1. **Deploy to Vercel**:
   ```bash
   npm run deploy
   ```

2. **Update manifest URLs**:
   - Update all URLs in `manifest.xml` to point to your Vercel deployment
   - Redistribute the updated manifest to users

## 🎯 Usage

### **Basic Usage**
1. Open a Word document
2. Click "सहायक" in the Home ribbon
3. Click "Scan Document" to analyze compliance
4. Review categorized issues in the side panel
5. Click on individual issues for detailed explanations
6. Use "Fix it" buttons for auto-corrections
7. Use "Clear Highlights" when done

### **Advanced Features**
- **Bulk Actions**: Fix all auto-fixable issues at once
- **Error Navigation**: Click error items to see detailed explanations
- **Real-time Highlighting**: Temporary highlights that don't modify the document
- **Category Filtering**: View issues by severity (Critical/Warning/Suggestions)

## 🏗️ Project Structure

```
sahayak-word-addin/
├── package.json              # Node.js configuration
├── README.md                 # Project documentation
├── vercel.json              # Vercel deployment config
└── public/
    ├── manifest.xml         # Office add-in manifest
    ├── taskpane.html        # Main UI (includes CSS & JS)
    └── commands.html        # Ribbon command functions
```

## 🔧 Configuration

### **Manifest Configuration**
The `manifest.xml` file contains:
- Add-in metadata and permissions
- Ribbon integration settings
- Icon and branding configuration
- URL endpoints for taskpane and commands

### **Validation Rules**
All validation rules are hardcoded in the `SahayakDocumentAnalyzer` class within `taskpane.html`. Rules are organized by category:
- `validateFonts()` - Font family and size validation
- `validateFormatting()` - Spacing, alignment, capitalization
- `validateContent()` - Prefix usage, acronyms, numbering
- `validateNumbers()` - Number representation, currency
- `validateDates()` - Date formatting, weekend checking

## 🚀 Deployment

### **Vercel Deployment**
1. Connect repository to Vercel
2. Deploy automatically on push to main branch
3. Update manifest.xml with production URLs
4. Distribute manifest to end users

### **Alternative Hosting**
- GitHub Pages
- Netlify
- Azure Static Web Apps
- Any static file hosting service

## 🧪 Testing

### **Local Testing**
1. Start development server: `npm run dev`
2. Sideload add-in in Word Desktop
3. Test with sample audit documents
4. Verify all validation rules work correctly

### **Production Testing**
1. Deploy to staging environment
2. Test with real audit documents
3. Verify cross-platform compatibility (Desktop/Web)
4. Performance testing with large documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-validation-rule`
3. Commit changes: `git commit -am 'Add new validation rule'`
4. Push to branch: `git push origin feature/new-validation-rule`
5. Submit a Pull Request

## 📝 Adding New Validation Rules

To add a new validation rule:

1. **Add the validation method**:
   ```javascript
   validateNewRule(text, index) {
       // Your validation logic here
       if (conditionNotMet) {
           this.addError({
               type: 'FORMAT_ERROR',
               category: 'WARNING',
               title: 'New Rule Violation',
               description: 'Description of the issue',
               location: { paragraphIndex: index, type: 'paragraph' },
               rule: 'Rule description',
               autoFixable: true/false
           });
       }
   }
   ```

2. **Call it from the appropriate validation method**:
   ```javascript
   validateContent(data) {
       data.paragraphs.forEach((para, index) => {
           // ... existing validations
           this.validateNewRule(para.text.trim(), index);
       });
   }
   ```

## 📊 Analytics & Monitoring

- Document scan frequency
- Most common rule violations
- Auto-fix success rates
- User engagement metrics

## 🔒 Security & Privacy

- **Client-side processing**: Documents never leave the user's machine
- **No data collection**: No personal or document data is transmitted
- **Temporary modifications**: All highlights are non-permanent
- **Secure hosting**: HTTPS-only deployment

## 📞 Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: Comprehensive inline documentation
- **Community**: Active community support

## 📜 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with Microsoft Office.js framework
- Inspired by Grammarly's user experience
- Designed for audit and compliance professionals

---

**Sahayak** - Making document compliance intelligent and effortless.
