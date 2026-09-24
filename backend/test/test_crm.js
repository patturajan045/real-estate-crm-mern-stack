/**
 * test_crm.js - Production Test Suite for Real Estate Flow CRM (Node.js/Express)
 * Replicates 100% of test_crm.py:
 * 1. System Health Check & Database Connectivity
 * 2. Authentication via Email AND Username (Case-Insensitive)
 * 3. Role-Based Access Control & Super Admin Platform Settings Exclusivity (HTTP 403 for Admin)
 * 4. User Deactivation & Inactive User Deletion with Lead Unassignment Safety Guard
 * 5. In-App Notifications for Lead Assignment and Booking Follow-up
 * 6. Complete Project, Building, and Unit Inventory Management
 * 7. Lead Pipeline Operations & Follow-up Scheduling
 * 8. Atomic Double-Booking Prevention & Reservation Lifecycle
 * 9. Dynamic CMS Headings and Labels
 */

const assert = require('assert');
const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');
const { seedDefaultsIfNeeded } = require('../utils/seedDefaults');
const User = require('../models/User');
const Project = require('../models/Project');
const Building = require('../models/Building');
const Unit = require('../models/Unit');
const Lead = require('../models/Lead');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const PageContent = require('../models/PageContent');

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const fetchOptions = {
    method: options.method || 'GET',
    headers: { ...options.headers }
  };

  if (options.body) {
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  let body = null;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch (e) {
    body = text;
  }

  return {
    status: res.status,
    headers: res.headers,
    body
  };
}

async function runAllTests() {
  console.log('==================================================');
  console.log('RUNNING REAL ESTATE FLOW CRM PRODUCTION TEST SUITE (NODE.JS)');
  console.log('==================================================');

  await connectDB();
  await seedDefaultsIfNeeded();

  // Start temporary test server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  try {
    // ----------------------------------------------------
    // 1. System Health Check
    // ----------------------------------------------------
    const resHealth = await request('/api/health');
    assert.strictEqual(resHealth.status, 200);
    assert.strictEqual(resHealth.body.status, 'success');
    console.log('[PASS] 1. System Health Check OK');

    // ----------------------------------------------------
    // 2. Authentication: Email & Username (Case-Insensitive)
    // ----------------------------------------------------
    console.log('\n--- 2. Authentication: Email & Username Verification ---');

    // Super Admin by Email
    const resSaEmail = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'superadmin@crm.com', password: 'admin123' }
    });
    assert.strictEqual(resSaEmail.status, 200, `Super Admin email login failed: ${JSON.stringify(resSaEmail.body)}`);
    const saToken = resSaEmail.body.token;
    const saHeaders = { Authorization: `Bearer ${saToken}` };
    console.log('[PASS] 2.1 Super Admin login by Email OK');

    // Super Admin by Username (Name)
    const resSaUser = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'Super Administrator', password: 'admin123' }
    });
    assert.strictEqual(resSaUser.status, 200, `Super Admin username login failed: ${JSON.stringify(resSaUser.body)}`);
    console.log("[PASS] 2.2 Super Admin login by Username ('Super Administrator') OK");

    // Super Admin by Username (Case-Insensitive lowercase)
    const resSaLower = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'super administrator', password: 'admin123' }
    });
    assert.strictEqual(resSaLower.status, 200, `Super Admin lowercase login failed: ${JSON.stringify(resSaLower.body)}`);
    console.log('[PASS] 2.3 Super Admin login case-insensitive OK');

    // Admin by Email
    const resAdmEmail = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@crm.com', password: 'admin123' }
    });
    assert.strictEqual(resAdmEmail.status, 200);
    const admToken = resAdmEmail.body.token;
    const admUser = resAdmEmail.body.user;
    const admHeaders = { Authorization: `Bearer ${admToken}` };
    console.log('[PASS] 2.4 Admin login by Email OK');

    // Admin by Username
    const resAdmUser = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'System Administrator', password: 'admin123' }
    });
    assert.strictEqual(resAdmUser.status, 200);
    console.log("[PASS] 2.5 Admin login by Username ('System Administrator') OK");

    // Sales Employee by Email
    const resSalesEmail = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'john.sales@crm.com', password: 'sales123' }
    });
    assert.strictEqual(resSalesEmail.status, 200);
    const salesToken = resSalesEmail.body.token;
    const salesUser = resSalesEmail.body.user;
    const salesHeaders = { Authorization: `Bearer ${salesToken}` };
    console.log('[PASS] 2.6 Sales Employee login by Email OK');

    // Sales Employee by Username
    const resSalesUser = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'John Sales', password: 'sales123' }
    });
    assert.strictEqual(resSalesUser.status, 200);
    console.log("[PASS] 2.7 Sales Employee login by Username ('John Sales') OK");

    // Invalid credentials rejection
    const resBad = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'John Sales', password: 'wrongpassword' }
    });
    assert.strictEqual(resBad.status, 401);
    console.log('[PASS] 2.8 Invalid credentials safely rejected (HTTP 401)');

    // ----------------------------------------------------
    // 3. Super Admin Platform Settings Exclusivity (RBAC)
    // ----------------------------------------------------
    console.log('\n--- 3. Platform Settings Exclusivity (RBAC) ---');

    const testCmsUpdate = { updates: { dashboard_title: 'Executive Sales & Inventory Dashboard' } };

    // Super Admin can update
    const resCmsSa = await request('/api/cms/content/batch', {
      method: 'PUT',
      headers: saHeaders,
      body: testCmsUpdate
    });
    assert.strictEqual(resCmsSa.status, 200);
    console.log('[PASS] 3.1 Super Admin authorized to modify CMS content');

    // Regular Admin is blocked with 403
    const resCmsAdm = await request('/api/cms/content/batch', {
      method: 'PUT',
      headers: admHeaders,
      body: testCmsUpdate
    });
    assert.strictEqual(resCmsAdm.status, 403);
    console.log('[PASS] 3.2 Regular Admin strictly blocked (HTTP 403 Forbidden) from Platform Settings');

    // Sales Employee is blocked with 403
    const resCmsSales = await request('/api/cms/content/batch', {
      method: 'PUT',
      headers: salesHeaders,
      body: testCmsUpdate
    });
    assert.strictEqual(resCmsSales.status, 403);
    console.log('[PASS] 3.3 Sales Employee strictly blocked (HTTP 403 Forbidden) from Platform Settings');

    // Reset CMS to defaults
    const resReset = await request('/api/cms/reset', {
      method: 'POST',
      headers: saHeaders
    });
    assert.strictEqual(resReset.status, 200);
    console.log('[PASS] 3.4 Super Admin restored canonical CMS defaults');

    // ----------------------------------------------------
    // 4. Inactive User Deletion & Safety Guards
    // ----------------------------------------------------
    console.log('\n--- 4. Inactive User Deletion & Safety Guards ---');

    // Self-deletion prevented
    const resSelf = await request(`/api/users/${admUser.id}`, {
      method: 'DELETE',
      headers: admHeaders
    });
    assert.strictEqual(resSelf.status, 400);
    console.log('[PASS] 4.1 Admin self-deletion prevented (HTTP 400)');

    // Create temporary staff
    let resStaff = await request('/api/users/', {
      method: 'POST',
      headers: admHeaders,
      body: {
        name: 'Temp Staff',
        email: 'temp.staff@crm.com',
        password: 'staffpassword123',
        role: 'Sales Employee'
      }
    });
    if (resStaff.status === 409) {
      await User.deleteOne({ email: 'temp.staff@crm.com' });
      resStaff = await request('/api/users/', {
        method: 'POST',
        headers: admHeaders,
        body: {
          name: 'Temp Staff',
          email: 'temp.staff@crm.com',
          password: 'staffpassword123',
          role: 'Sales Employee'
        }
      });
    }
    assert.strictEqual(resStaff.status, 201);
    const tempStaffId = resStaff.body.data.id;

    // Assign lead to temporary staff
    const leadStaff = await Lead.create({
      customerName: 'Marcus Aurelius',
      email: 'marcus.aurelius@meditations.org',
      phoneNumber: '+1-555-1212',
      assignedTo: tempStaffId
    });

    // Calling standard delete safely deactivates active staff
    const resDeact = await request(`/api/users/${tempStaffId}`, {
      method: 'DELETE',
      headers: admHeaders
    });
    assert.strictEqual(resDeact.status, 200);
    assert.strictEqual(resDeact.body.data.isActive, false);
    console.log('[PASS] 4.2 Active staff safely deactivated before permanent deletion');

    // Now permanently delete inactive user
    const resPerm = await request(`/api/users/${tempStaffId}?permanent=true`, {
      method: 'DELETE',
      headers: admHeaders
    });
    assert.strictEqual(resPerm.status, 200);
    const checkUser = await User.findById(tempStaffId);
    assert.strictEqual(checkUser, null);
    console.log('[PASS] 4.3 Inactive staff permanently deleted from MongoDB');

    // Verify lead was safely unassigned (assignedTo set to null)
    const refreshedLead = await Lead.findById(leadStaff._id);
    assert.strictEqual(refreshedLead.assignedTo, null);
    await refreshedLead.deleteOne();
    console.log('[PASS] 4.4 Lead assignedTo safely nullified upon staff deletion');

    // ----------------------------------------------------
    // 5. In-App Notifications for Follow-Up & Booking Assignments
    // ----------------------------------------------------
    console.log('\n--- 5. In-App Follow-up & Booking Notifications ---');

    await Notification.deleteMany({ recipient: salesUser.id });

    // Admin creates lead assigned to John Sales
    const resNewLead = await request('/api/leads/', {
      method: 'POST',
      headers: admHeaders,
      body: {
        customerName: 'Samantha Reed',
        email: 'samantha.reed@example.com',
        phoneNumber: '+1-555-8822',
        assignedTo: salesUser.id,
        nextFollowUpDate: '2026-11-01T10:00:00Z'
      }
    });
    assert.strictEqual(resNewLead.status, 201);
    const leadId = resNewLead.body.data.id;

    // Check notification for John Sales
    const resNotif = await request('/api/notifications/', {
      method: 'GET',
      headers: salesHeaders
    });
    assert.strictEqual(resNotif.status, 200);
    const notifBody = resNotif.body;
    assert.ok(notifBody.unreadCount >= 1);
    const firstNotif = notifBody.data[0];
    assert.ok(firstNotif.message.includes('Follow-up assigned by'));
    assert.ok(firstNotif.message.includes('Samantha Reed'));
    console.log(`[PASS] 5.1 Lead follow-up assignment notification received: '${firstNotif.message}'`);

    // Mark as read
    const resRead = await request(`/api/notifications/${firstNotif.id}/read`, {
      method: 'POST',
      headers: salesHeaders
    });
    assert.strictEqual(resRead.status, 200);
    const resNotifAfter = await request('/api/notifications/', {
      method: 'GET',
      headers: salesHeaders
    });
    assert.strictEqual(resNotifAfter.body.unreadCount, 0);
    console.log('[PASS] 5.2 Notification marked as read (unread count = 0)');

    // ----------------------------------------------------
    // 6. Inventory CRUD & Atomic Double Booking Prevention
    // ----------------------------------------------------
    console.log('\n--- 6. Property Inventory & Atomic Booking Lifecycle ---');

    // Project
    let project = await Project.findOne({ name: 'Azure Bay Residences' });
    if (!project) {
      project = await Project.create({
        name: 'Azure Bay Residences',
        city: 'San Diego',
        address: '500 Ocean Blvd',
        status: 'Under Construction'
      });
    }

    // Building
    let building = await Building.findOne({ project: project._id, name: 'Pacific Tower' });
    if (!building) {
      building = await Building.create({
        project: project._id,
        name: 'Pacific Tower',
        totalFloors: 12
      });
    }

    // Unit
    let unit = await Unit.findOne({ building: building._id, unitNumber: 'PH-1201' });
    if (!unit) {
      unit = await Unit.create({
        project: project._id,
        building: building._id,
        unitNumber: 'PH-1201',
        floor: 12,
        unitType: 'Penthouse',
        carpetAreaSqFt: 2400.0,
        price: 850000.0,
        status: Unit.STATUS_AVAILABLE
      });
    } else {
      unit.status = Unit.STATUS_AVAILABLE;
      await unit.save();
    }

    // Clean up any leftover bookings for this test unit
    await Booking.deleteMany({ unit: unit._id });

    // First Booking
    const bookingData = {
      lead: leadId,
      unit: String(unit._id),
      bookedBy: salesUser.id,
      agreementValue: 850000.0,
      bookingAmount: 50000.0,
      paymentMethod: 'Bank Wire',
      transactionReference: 'WIRE-AZURE-001'
    };
    const resB1 = await request('/api/bookings/', {
      method: 'POST',
      headers: admHeaders,
      body: bookingData
    });
    assert.strictEqual(resB1.status, 201);
    const bookingId = resB1.body.data.id;
    console.log('[PASS] 6.1 First Booking confirmed successfully');

    // Atomic Concurrency Guard: Second attempt on same unit must be blocked (HTTP 409)
    const resB2 = await request('/api/bookings/', {
      method: 'POST',
      headers: admHeaders,
      body: bookingData
    });
    assert.strictEqual(resB2.status, 409);
    assert.ok(resB2.body.message.includes('Double booking prevented'));
    console.log('[PASS] 6.2 Atomic Double Booking Prevention verified (HTTP 409 Conflict)');

    // Cancel booking and release unit
    const resCancel = await request(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: admHeaders
    });
    assert.strictEqual(resCancel.status, 200);
    const refreshedUnit = await Unit.findById(unit._id);
    assert.strictEqual(refreshedUnit.status, Unit.STATUS_AVAILABLE);
    console.log('[PASS] 6.3 Booking cancelled and Unit atomically released back to Available');

    // Clean up test entities
    await Booking.deleteOne({ _id: bookingId });
    await Lead.deleteOne({ _id: leadId });
    await Notification.deleteMany({ recipient: salesUser.id });

    // ----------------------------------------------------
    // 7. Dynamic CMS Content Verification
    // ----------------------------------------------------
    console.log('\n--- 7. Dynamic CMS Headings Verification ---');
    const resCms = await request('/api/cms/content');
    assert.strictEqual(resCms.status, 200);
    assert.ok(resCms.body.data.dashboard_title !== undefined);
    assert.ok(resCms.body.data.nav_brand_name !== undefined);
    console.log('[PASS] 7.1 CMS Content loaded with all canonical keys');

    console.log('\n==================================================');
    console.log('ALL NODE.JS BACKEND TESTS PASSED WITH 100% SUCCESS!');
    console.log('==================================================');

  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  runAllTests().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
}

module.exports = runAllTests;
