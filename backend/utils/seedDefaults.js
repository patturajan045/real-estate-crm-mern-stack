const User = require('../models/User');
const PageContent = require('../models/PageContent');
const { hashPassword } = require('./passwordUtils');

const DEFAULT_PAGE_CONTENTS = [
  // Login Page
  { page: 'login', sectionKey: 'login_brand_title', label: 'Login Brand Title', content: 'EstateFlow CRM', contentType: 'title', sortOrder: 1 },
  { page: 'login', sectionKey: 'login_brand_subtitle', label: 'Login Brand Subtitle', content: 'Real Estate Sales & Booking Platform', contentType: 'subtitle', sortOrder: 2 },
  { page: 'login', sectionKey: 'login_heading', label: 'Login Card Heading', content: 'Sign In to Your Account', contentType: 'heading', sortOrder: 3 },
  { page: 'login', sectionKey: 'login_subheading', label: 'Login Instruction Subheading', content: 'Enter your verified credentials to access your real estate workspace', contentType: 'paragraph', sortOrder: 4 },
  { page: 'login', sectionKey: 'login_label_identifier', label: 'Login Field Label', content: 'Email or Username', contentType: 'heading', sortOrder: 5 },
  { page: 'login', sectionKey: 'login_footer_text', label: 'Login Footer Copyright / Note', content: '© 2026 EstateFlow CRM. Protected by JWT Authentication.', contentType: 'paragraph', sortOrder: 6 },

  // Register Page
  { page: 'register', sectionKey: 'register_brand_title', label: 'Register Brand Title', content: 'EstateFlow CRM', contentType: 'title', sortOrder: 1 },
  { page: 'register', sectionKey: 'register_brand_subtitle', label: 'Register Brand Subtitle', content: 'Real Estate Sales & Booking Platform', contentType: 'subtitle', sortOrder: 2 },
  { page: 'register', sectionKey: 'register_heading', label: 'Register Card Heading', content: 'Create Team Account', contentType: 'heading', sortOrder: 3 },
  { page: 'register', sectionKey: 'register_subheading', label: 'Register Instruction Subheading', content: 'Join the sales and property management team', contentType: 'paragraph', sortOrder: 4 },
  { page: 'register', sectionKey: 'register_footer_text', label: 'Register Footer Note', content: 'Role permissions will be verified according to administrative policy.', contentType: 'paragraph', sortOrder: 5 },

  // Dashboard Page
  { page: 'dashboard', sectionKey: 'dashboard_title', label: 'Dashboard Page Title', content: 'Sales & Inventory Dashboard', contentType: 'title', sortOrder: 1 },
  { page: 'dashboard', sectionKey: 'dashboard_subtitle', label: 'Dashboard Page Subtitle', content: 'Live metrics, lead pipeline progress, and upcoming follow-ups', contentType: 'subtitle', sortOrder: 2 },
  { page: 'dashboard', sectionKey: 'dashboard_welcome_text', label: 'Dashboard Welcome Note', content: 'Welcome back! Here is an overview of your property leads and inventory performance.', contentType: 'paragraph', sortOrder: 3 },
  { page: 'dashboard', sectionKey: 'dashboard_pipeline_heading', label: 'Pipeline Chart Heading', content: 'Leads by Pipeline Stage', contentType: 'heading', sortOrder: 4 },
  { page: 'dashboard', sectionKey: 'dashboard_inventory_heading', label: 'Inventory Chart Heading', content: 'Unit Inventory Status', contentType: 'heading', sortOrder: 5 },
  { page: 'dashboard', sectionKey: 'dashboard_followups_heading', label: 'Follow-ups Section Heading', content: 'Pending & Urgent Follow-ups', contentType: 'heading', sortOrder: 6 },
  { page: 'dashboard', sectionKey: 'dashboard_bookings_heading', label: 'Recent Bookings Heading', content: 'Recent Bookings & Agreements', contentType: 'heading', sortOrder: 7 },

  // Leads Page
  { page: 'leads', sectionKey: 'leads_title', label: 'Leads Page Title', content: 'Leads Management', contentType: 'title', sortOrder: 1 },
  { page: 'leads', sectionKey: 'leads_subtitle', label: 'Leads Page Subtitle', content: 'Manage prospect pipeline, schedule follow-ups, and convert leads to bookings', contentType: 'subtitle', sortOrder: 2 },
  { page: 'leads', sectionKey: 'leads_notice_text', label: 'Leads Notice Note', content: 'Click any lead to view call history, log notes, or convert directly to a property booking.', contentType: 'paragraph', sortOrder: 3 },

  // Properties Page
  { page: 'properties', sectionKey: 'properties_title', label: 'Properties Page Title', content: 'Property & Inventory Management', contentType: 'title', sortOrder: 1 },
  { page: 'properties', sectionKey: 'properties_subtitle', label: 'Properties Page Subtitle', content: 'Explore real estate projects, buildings, and unit availability in real time', contentType: 'subtitle', sortOrder: 2 },
  { page: 'properties', sectionKey: 'properties_units_heading', label: 'Units Tab Heading', content: 'Real-time Property Units Inventory', contentType: 'heading', sortOrder: 3 },
  { page: 'properties', sectionKey: 'properties_projects_heading', label: 'Projects Tab Heading', content: 'Master Real Estate Projects', contentType: 'heading', sortOrder: 4 },
  { page: 'properties', sectionKey: 'properties_buildings_heading', label: 'Buildings Tab Heading', content: 'Towers & Buildings Directory', contentType: 'heading', sortOrder: 5 },

  // Bookings Page
  { page: 'bookings', sectionKey: 'bookings_title', label: 'Bookings Page Title', content: 'Bookings Management', contentType: 'title', sortOrder: 1 },
  { page: 'bookings', sectionKey: 'bookings_subtitle', label: 'Bookings Page Subtitle', content: 'Connect customer leads with property units and process reservation agreements', contentType: 'subtitle', sortOrder: 2 },
  { page: 'bookings', sectionKey: 'bookings_protection_notice', label: 'Double Booking Guard Notice', content: 'Double Booking Protection: Unit availability is atomically secured. If another agent reserves the same unit concurrently, your agreement will be safely protected from collision.', contentType: 'notice', sortOrder: 3 },

  // Users Page
  { page: 'users', sectionKey: 'users_title', label: 'Users Page Title', content: 'Team & User Management', contentType: 'title', sortOrder: 1 },
  { page: 'users', sectionKey: 'users_subtitle', label: 'Users Page Subtitle', content: 'Manage employee accounts, permissions, and roles (Super Admin, Admin, Sales Employee)', contentType: 'subtitle', sortOrder: 2 },
  { page: 'users', sectionKey: 'users_role_policy_notice', label: 'User Policy Notice', content: 'Role-Based Access Control: Super Admin has full authority, Admin manages team & inventory, Sales Employees manage leads & bookings.', contentType: 'notice', sortOrder: 3 },

  // Settings (CMS) Page
  { page: 'settings', sectionKey: 'settings_title', label: 'Settings Page Title', content: 'Platform Content & Dynamic Headings', contentType: 'title', sortOrder: 1 },
  { page: 'settings', sectionKey: 'settings_subtitle', label: 'Settings Page Subtitle', content: 'Customize all headings, titles, subheadings, and paragraphs dynamically across the system', contentType: 'subtitle', sortOrder: 2 },
  { page: 'settings', sectionKey: 'settings_info_banner', label: 'Settings Instructions Banner', content: 'All changes saved here update system records instantly and apply across the entire portal for all users without code changes.', contentType: 'paragraph', sortOrder: 3 },

  // Global Navigation & Sidebar
  { page: 'navigation', sectionKey: 'nav_brand_name', label: 'Sidebar Brand Name', content: 'EstateFlow', contentType: 'title', sortOrder: 1 },
  { page: 'navigation', sectionKey: 'nav_brand_subtitle', label: 'Sidebar Brand Subtitle', content: 'Real Estate CRM', contentType: 'subtitle', sortOrder: 2 },
  { page: 'navigation', sectionKey: 'nav_menu_overview', label: 'Menu Header: Overview', content: 'Overview', contentType: 'heading', sortOrder: 3 },
  { page: 'navigation', sectionKey: 'nav_menu_dashboard', label: 'Menu Item: Dashboard', content: 'Dashboard', contentType: 'title', sortOrder: 4 },
  { page: 'navigation', sectionKey: 'nav_menu_pipeline', label: 'Menu Header: Sales Pipeline', content: 'Sales Pipeline', contentType: 'heading', sortOrder: 5 },
  { page: 'navigation', sectionKey: 'nav_menu_leads', label: 'Menu Item: Leads', content: 'Leads', contentType: 'title', sortOrder: 6 },
  { page: 'navigation', sectionKey: 'nav_menu_bookings', label: 'Menu Item: Bookings', content: 'Bookings', contentType: 'title', sortOrder: 7 },
  { page: 'navigation', sectionKey: 'nav_menu_inventory', label: 'Menu Header: Inventory', content: 'Inventory', contentType: 'heading', sortOrder: 8 },
  { page: 'navigation', sectionKey: 'nav_menu_properties', label: 'Menu Item: Properties & Units', content: 'Properties & Units', contentType: 'title', sortOrder: 9 },
  { page: 'navigation', sectionKey: 'nav_menu_admin', label: 'Menu Header: Administration', content: 'Administration', contentType: 'heading', sortOrder: 10 },
  { page: 'navigation', sectionKey: 'nav_menu_users', label: 'Menu Item: Users & Team', content: 'Users & Team', contentType: 'title', sortOrder: 11 },
  { page: 'navigation', sectionKey: 'nav_menu_settings', label: 'Menu Item: Platform Settings', content: 'Platform Settings', contentType: 'title', sortOrder: 12 },
  { page: 'navigation', sectionKey: 'nav_btn_logout', label: 'Header Logout Button Label', content: 'Logout', contentType: 'title', sortOrder: 13 }
];

async function seedDefaultsIfNeeded() {
  try {
    // 1. Seed Default Accounts
    const defaultAccounts = [
      {
        name: 'Super Administrator',
        email: 'superadmin@crm.com',
        password: 'admin123',
        role: 'Super Admin',
        phoneNumber: '+1 800 555 0199'
      },
      {
        name: 'System Administrator',
        email: 'admin@crm.com',
        password: 'admin123',
        role: 'Admin',
        phoneNumber: '+1 800 555 0198'
      },
      {
        name: 'John Sales',
        email: 'john.sales@crm.com',
        password: 'sales123',
        role: 'Sales Employee',
        phoneNumber: '+1 800 555 0197'
      }
    ];

    for (const acc of defaultAccounts) {
      const existing = await User.findOne({ email: acc.email });
      if (!existing) {
        await User.create({
          name: acc.name,
          email: acc.email,
          password: hashPassword(acc.password),
          role: acc.role,
          phoneNumber: acc.phoneNumber,
          isActive: true
        });
        console.log(`Auto-bootstrapped default account: ${acc.email}`);
      }
    }

    // 2. Seed Default CMS Headings
    for (const item of DEFAULT_PAGE_CONTENTS) {
      const existing = await PageContent.findOne({ sectionKey: item.sectionKey });
      if (!existing) {
        await PageContent.create(item);
      }
    }
  } catch (err) {
    console.error('Error auto-bootstrapping defaults:', err);
  }
}

module.exports = {
  DEFAULT_PAGE_CONTENTS,
  seedDefaultsIfNeeded
};
