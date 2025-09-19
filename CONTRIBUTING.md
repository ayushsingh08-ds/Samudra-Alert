# Contributing to Samudra Alert

Thank you for your interest in contributing to Samudra Alert! This document provides guidelines for contributing to this coastal hazard early warning system.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Git
- Basic knowledge of React, TypeScript, and Leaflet.js

### Setting up the Development Environment

1. **Fork the repository**

   - Click the "Fork" button on the GitHub repository page
   - Clone your fork: `git clone https://github.com/your-username/samudra-alert.git`

2. **Install dependencies**

   ```bash
   cd samudra-alert/frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 📋 How to Contribute

### Reporting Issues

- Use the GitHub issue tracker to report bugs
- Include detailed steps to reproduce the issue
- Provide information about your environment (OS, browser, Node.js version)

### Suggesting Features

- Open an issue with the "feature request" label
- Describe the feature and its use case
- Explain why it would be valuable for coastal hazard management

### Code Contributions

#### Branch Naming Convention

- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring

#### Development Workflow

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Follow the existing code style
   - Add comments for complex logic
   - Ensure TypeScript compliance

3. **Test your changes**

   - Test all dashboard views (Citizen, Analyst, Admin)
   - Verify map functionality
   - Check responsive design

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🎯 Areas for Contribution

### Frontend Development

- **UI/UX Improvements**: Enhance dashboard designs and user experience
- **Component Development**: Create reusable components for common functionality
- **Accessibility**: Improve accessibility features for all users
- **Mobile Responsiveness**: Enhance mobile device compatibility

### Backend Development (Future)

- **API Development**: Build RESTful APIs for data management
- **Database Design**: Implement PostgreSQL with PostGIS for spatial data
- **Authentication**: Implement secure user authentication system
- **Real-time Features**: Add WebSocket support for live updates

### AI/ML Integration (Future)

- **Image Analysis**: Develop models for hazard detection in citizen photos
- **NLP Processing**: Implement text analysis for report verification
- **Predictive Models**: Create models for hazard prediction

### Documentation

- **API Documentation**: Document backend APIs when developed
- **User Guides**: Create guides for different user roles
- **Technical Documentation**: Improve code documentation

## 🎨 Code Style Guidelines

### TypeScript/React

- Use functional components with hooks
- Implement proper TypeScript typing
- Follow React best practices
- Use meaningful variable and function names

### CSS/Styling

- Use Tailwind CSS classes when possible
- Maintain consistent spacing and typography
- Ensure responsive design principles
- Follow BEM methodology for custom CSS

### File Organization

```
src/
├── components/     # Reusable UI components
├── pages/         # Main dashboard pages
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── styles/        # Global styles
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] All dashboard views load correctly
- [ ] Navigation between dashboards works
- [ ] Map interactions function properly
- [ ] Responsive design works on mobile
- [ ] Forms submit and validate correctly
- [ ] Error states display appropriately

### Future Automated Testing

- Unit tests for components
- Integration tests for user workflows
- End-to-end tests for critical paths

## 📝 Pull Request Guidelines

### PR Title Format

- Use clear, descriptive titles
- Start with action verbs (Add, Fix, Update, Remove)
- Example: "Add: User authentication system"

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing

- [ ] Manual testing completed
- [ ] All dashboards tested
- [ ] Mobile responsiveness verified

## Screenshots (if applicable)

Add screenshots of UI changes

## Additional Notes

Any additional context or considerations
```

### Review Process

1. At least one maintainer review required
2. All discussions must be resolved
3. CI checks must pass (when implemented)
4. No merge conflicts

## 🌍 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers get started
- Focus on the project's mission of coastal safety

### Communication

- Use GitHub issues for bugs and features
- Use clear, professional language
- Be patient with response times
- Provide context in discussions

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority items
- `priority: low` - Low priority items

## 📞 Getting Help

- Check existing issues and documentation first
- Create a new issue with detailed information
- Tag relevant maintainers if needed
- Be specific about your environment and steps taken

## 🙏 Recognition

Contributors will be acknowledged in:

- README.md contributors section
- Release notes for significant contributions
- Special recognition for consistent contributors

Thank you for helping make coastal communities safer through technology! 🌊
