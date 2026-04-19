// نظام الصلاحيات المتقدم

// تعريف جميع الصلاحيات المتاحة
export const PERMISSIONS = {
  // Users Management
  USERS_VIEW: 'users_view',
  USERS_CREATE: 'users_create',
  USERS_EDIT: 'users_edit',
  USERS_DELETE: 'users_delete',
  USERS_CHANGE_ROLE: 'users_change_role',

  // Bookings Management
  BOOKINGS_VIEW: 'bookings_view',
  BOOKINGS_EDIT: 'bookings_edit',
  BOOKINGS_DELETE: 'bookings_delete',
  BOOKINGS_CHANGE_STATUS: 'bookings_change_status',

  // Messages/Contacts Management
  MESSAGES_VIEW: 'messages_view',
  MESSAGES_EDIT: 'messages_edit',
  MESSAGES_DELETE: 'messages_delete',
  MESSAGES_CHANGE_STATUS: 'messages_change_status',

  // Blog Management
  BLOG_VIEW: 'blog_view',
  BLOG_CREATE: 'blog_create',
  BLOG_EDIT: 'blog_edit',
  BLOG_DELETE: 'blog_delete',
  BLOG_PUBLISH: 'blog_publish',

  // Careers Management
  CAREERS_VIEW: 'careers_view',
  CAREERS_EDIT: 'careers_edit',
  CAREERS_DELETE: 'careers_delete',
  CAREERS_CHANGE_STATUS: 'careers_change_status',

  // Employers Management
  EMPLOYERS_VIEW: 'employers_view',
  EMPLOYERS_APPROVE: 'employers_approve',
  EMPLOYERS_REJECT: 'employers_reject',
  EMPLOYERS_DELETE: 'employers_delete',

  // Home Editor
  HOME_EDIT: 'home_edit',

  // Sub-Admins Management (Super Admin only)
  SUBADMINS_VIEW: 'subadmins_view',
  SUBADMINS_CREATE: 'subadmins_create',
  SUBADMINS_EDIT: 'subadmins_edit',
  SUBADMINS_DELETE: 'subadmins_delete',
  SUBADMINS_MANAGE_PERMISSIONS: 'subadmins_manage_permissions',

  // Analytics & Reports
  ANALYTICS_VIEW: 'analytics_view',
  REPORTS_EXPORT: 'reports_export',
}

// الصلاحيات الافتراضية لكل دور
export const DEFAULT_PERMISSIONS = {
  // Super Admin - كل الصلاحيات
  admin: Object.values(PERMISSIONS),

  // Sub-Admin - صلاحيات محدودة (يمكن تخصيصها)
  subadmin: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.BOOKINGS_CHANGE_STATUS,
    PERMISSIONS.MESSAGES_VIEW,
    PERMISSIONS.MESSAGES_CHANGE_STATUS,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.CAREERS_VIEW,
    PERMISSIONS.CAREERS_CHANGE_STATUS,
  ],

  // Client - لا صلاحيات إدارية
  client: [],

  // Employer - لا صلاحيات إدارية
  employer: [],
}

// مجموعات الصلاحيات (للتسهيل)
export const PERMISSION_GROUPS = {
  users: {
    label: 'إدارة المستخدمين',
    permissions: [
      { key: PERMISSIONS.USERS_VIEW, label: 'عرض المستخدمين' },
      { key: PERMISSIONS.USERS_CREATE, label: 'إضافة مستخدمين' },
      { key: PERMISSIONS.USERS_EDIT, label: 'تعديل المستخدمين' },
      { key: PERMISSIONS.USERS_DELETE, label: 'حذف المستخدمين' },
      { key: PERMISSIONS.USERS_CHANGE_ROLE, label: 'تغيير الأدوار' },
    ]
  },
  bookings: {
    label: 'إدارة الحجوزات',
    permissions: [
      { key: PERMISSIONS.BOOKINGS_VIEW, label: 'عرض الحجوزات' },
      { key: PERMISSIONS.BOOKINGS_EDIT, label: 'تعديل الحجوزات' },
      { key: PERMISSIONS.BOOKINGS_DELETE, label: 'حذف الحجوزات' },
      { key: PERMISSIONS.BOOKINGS_CHANGE_STATUS, label: 'تغيير حالة الحجز' },
    ]
  },
  messages: {
    label: 'إدارة الرسائل',
    permissions: [
      { key: PERMISSIONS.MESSAGES_VIEW, label: 'عرض الرسائل' },
      { key: PERMISSIONS.MESSAGES_EDIT, label: 'تعديل الرسائل' },
      { key: PERMISSIONS.MESSAGES_DELETE, label: 'حذف الرسائل' },
      { key: PERMISSIONS.MESSAGES_CHANGE_STATUS, label: 'تغيير حالة الرسالة' },
    ]
  },
  blog: {
    label: 'إدارة المدونة',
    permissions: [
      { key: PERMISSIONS.BLOG_VIEW, label: 'عرض المقالات' },
      { key: PERMISSIONS.BLOG_CREATE, label: 'إنشاء مقالات' },
      { key: PERMISSIONS.BLOG_EDIT, label: 'تعديل المقالات' },
      { key: PERMISSIONS.BLOG_DELETE, label: 'حذف المقالات' },
      { key: PERMISSIONS.BLOG_PUBLISH, label: 'نشر/إلغاء نشر' },
    ]
  },
  careers: {
    label: 'إدارة التوظيف',
    permissions: [
      { key: PERMISSIONS.CAREERS_VIEW, label: 'عرض الطلبات' },
      { key: PERMISSIONS.CAREERS_EDIT, label: 'تعديل الطلبات' },
      { key: PERMISSIONS.CAREERS_DELETE, label: 'حذف الطلبات' },
      { key: PERMISSIONS.CAREERS_CHANGE_STATUS, label: 'تغيير الحالة' },
    ]
  },
  employers: {
    label: 'إدارة أصحاب العمل',
    permissions: [
      { key: PERMISSIONS.EMPLOYERS_VIEW, label: 'عرض أصحاب العمل' },
      { key: PERMISSIONS.EMPLOYERS_APPROVE, label: 'الموافقة على الحسابات' },
      { key: PERMISSIONS.EMPLOYERS_REJECT, label: 'رفض الحسابات' },
      { key: PERMISSIONS.EMPLOYERS_DELETE, label: 'حذف الحسابات' },
    ]
  },
  content: {
    label: 'إدارة المحتوى',
    permissions: [
      { key: PERMISSIONS.HOME_EDIT, label: 'تعديل الصفحة الرئيسية' },
    ]
  },
  subadmins: {
    label: 'إدارة المساعدين (Super Admin فقط)',
    permissions: [
      { key: PERMISSIONS.SUBADMINS_VIEW, label: 'عرض المساعدين' },
      { key: PERMISSIONS.SUBADMINS_CREATE, label: 'إضافة مساعدين' },
      { key: PERMISSIONS.SUBADMINS_EDIT, label: 'تعديل المساعدين' },
      { key: PERMISSIONS.SUBADMINS_DELETE, label: 'حذف المساعدين' },
      { key: PERMISSIONS.SUBADMINS_MANAGE_PERMISSIONS, label: 'إدارة الصلاحيات' },
    ]
  },
  analytics: {
    label: 'التقارير والإحصائيات',
    permissions: [
      { key: PERMISSIONS.ANALYTICS_VIEW, label: 'عرض الإحصائيات' },
      { key: PERMISSIONS.REPORTS_EXPORT, label: 'تصدير التقارير' },
    ]
  },
}

// التحقق من صلاحية معينة
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false
  }
  return userPermissions.includes(requiredPermission)
}

// التحقق من أي صلاحية من مجموعة
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false
  }
  return requiredPermissions.some(perm => userPermissions.includes(perm))
}

// التحقق من جميع الصلاحيات
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false
  }
  return requiredPermissions.every(perm => userPermissions.includes(perm))
}

// الحصول على صلاحيات المستخدم الحالي
export const getCurrentUserPermissions = () => {
  const userData = localStorage.getItem('user_data')
  if (!userData) return []

  try {
    const user = JSON.parse(userData)
    
    // Super Admin له كل الصلاحيات
    if (user.role === 'admin') {
      return DEFAULT_PERMISSIONS.admin
    }

    // Sub-Admin له صلاحيات مخصصة
    if (user.role === 'subadmin') {
      return user.permissions || DEFAULT_PERMISSIONS.subadmin
    }

    return []
  } catch (error) {
    console.error('Error getting user permissions:', error)
    return []
  }
}

// التحقق من أن المستخدم Super Admin
export const isSuperAdmin = () => {
  const userData = localStorage.getItem('user_data')
  if (!userData) return false

  try {
    const user = JSON.parse(userData)
    return user.role === 'admin'
  } catch (error) {
    return false
  }
}

// التحقق من أن المستخدم Sub-Admin
export const isSubAdmin = () => {
  const userData = localStorage.getItem('user_data')
  if (!userData) return false

  try {
    const user = JSON.parse(userData)
    return user.role === 'subadmin'
  } catch (error) {
    return false
  }
}

// الحصول على معلومات المستخدم الحالي
export const getCurrentUser = () => {
  const userData = localStorage.getItem('user_data')
  if (!userData) return null

  try {
    return JSON.parse(userData)
  } catch (error) {
    return null
  }
}
